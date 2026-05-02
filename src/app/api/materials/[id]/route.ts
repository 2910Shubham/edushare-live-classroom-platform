import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import cloudinary from '@/lib/cloudinary';
import { parseResCloudinaryUrl } from '@/lib/cloudinary-delivery';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: materialId } = await params;

    // Find the material to verify ownership and get Cloudinary info
    const material = await db.material.findUnique({
      where: { id: materialId },
      include: {
        classroom: {
          select: { teacherId: true }
        }
      }
    });

    if (!material) {
      return NextResponse.json({ error: 'Material not found' }, { status: 404 });
    }

    // Debug authorization
    console.log('Delete Authorization Debug:');
    console.log('- Material ID:', materialId);
    console.log('- Material Title:', material.title);
    console.log('- Classroom Teacher ID:', material.classroom.teacherId);
    console.log('- Current User ID:', session.user.id);
    console.log('- Current User Email:', session.user.email);

    // Check if user is authorized to delete (teacher of the classroom or admin)
    const isTeacher = material.classroom.teacherId === session.user.id;
    const isAdmin = session.user.email === 'admin@edushare.app'; // Simple admin check

    if (!isTeacher && !isAdmin) {
      console.log('Authorization failed: User is not the classroom teacher or admin');
      return NextResponse.json({ 
        error: 'Forbidden - Only the classroom teacher or admin can delete materials',
        debug: {
          currentUserId: session.user.id,
          classroomTeacherId: material.classroom.teacherId,
          isTeacher,
          isAdmin
        }
      }, { status: 403 });
    }

    console.log(`Authorization successful: ${isAdmin ? 'Admin' : 'Teacher'} deleting material`);

    console.log(`Deleting material: ${material.title} (${materialId})`);

    // Delete from Cloudinary first
    let cloudinaryDeleteSuccess = false;
    let cloudinaryError = null;

    try {
      if (material.fileUrl) {
        console.log(`Attempting to delete from Cloudinary: ${material.fileUrl}`);

        // Parse the Cloudinary URL to extract public_id
        const parsedUrl = parseResCloudinaryUrl(material.fileUrl);
        
        if (parsedUrl) {
          console.log(`Parsed Cloudinary URL:`, parsedUrl);

          // Delete from Cloudinary using the public_id and resource_type
          const deleteResult = await cloudinary.uploader.destroy(parsedUrl.publicId, {
            resource_type: parsedUrl.resourceType,
            invalidate: true, // Invalidate CDN cache
          });

          console.log(`Cloudinary delete result:`, deleteResult);

          if (deleteResult.result === 'ok' || deleteResult.result === 'not found') {
            cloudinaryDeleteSuccess = true;
            console.log(`Successfully deleted from Cloudinary or file not found`);
          } else {
            cloudinaryError = deleteResult;
            console.error(`Failed to delete from Cloudinary:`, deleteResult);
          }
        } else {
          console.warn(`Could not parse Cloudinary URL: ${material.fileUrl}`);
          // Continue with database deletion even if Cloudinary parsing fails
          cloudinaryDeleteSuccess = true;
        }
      } else {
        console.log(`No fileUrl found for material ${materialId}`);
        cloudinaryDeleteSuccess = true;
      }
    } catch (error) {
      console.error(`Error deleting from Cloudinary:`, error);
      cloudinaryError = error;
    }

    // Delete related data first (due to foreign key constraints)
    await db.annotation.deleteMany({
      where: { materialId }
    });

    await db.studentNote.deleteMany({
      where: { materialId }
    });

    // Update any board sessions that reference this material
    await db.boardSession.updateMany({
      where: { materialId },
      data: { materialId: null }
    });

    // Delete the material from database
    await db.material.delete({
      where: { id: materialId }
    });

    console.log(`Successfully deleted material from database: ${materialId}`);

    return NextResponse.json({
      success: true,
      message: 'Material deleted successfully',
      cloudinaryDeleted: cloudinaryDeleteSuccess,
      cloudinaryError: cloudinaryError ? String(cloudinaryError) : null
    });

  } catch (error) {
    console.error('Error deleting material:', error);
    return NextResponse.json(
      { error: 'Failed to delete material' },
      { status: 500 }
    );
  }
}
