import type { QuizQuestion } from '@/types/quiz';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // Level 1 – Easy
  {
    id: 'q1',
    question: 'Who was the first Prime Minister of India?',
    options: ['Sardar Patel', 'Jawaharlal Nehru', 'Lal Bahadur Shastri', 'Rajendra Prasad'],
    correctIndex: 1,
  },
  {
    id: 'q2',
    question: 'Who is the current Prime Minister of India?',
    options: ['Narendra Modi', 'Rahul Gandhi', 'Amit Shah', 'Yogi Adityanath'],
    correctIndex: 0,
  },
  {
    id: 'q3',
    question: 'Who was the first woman Prime Minister of India?',
    options: ['Sonia Gandhi', 'Indira Gandhi', 'Pratibha Patil', 'Sarojini Naidu'],
    correctIndex: 1,
  },
  {
    id: 'q4',
    question: 'Who was the first woman President of India?',
    options: ['Droupadi Murmu', 'Pratibha Patil', 'Indira Gandhi', 'Meira Kumar'],
    correctIndex: 1,
  },
  {
    id: 'q5',
    question: "Who was India's first woman IPS officer?",
    options: ['Kiran Bedi', 'Kalpana Chawla', 'Bachendri Pal', 'P. T. Usha'],
    correctIndex: 0,
  },
  {
    id: 'q6',
    question: "What was India's first satellite?",
    options: ['Rohini', 'Chandrayaan-1', 'Aryabhata', 'INSAT'],
    correctIndex: 2,
  },
  {
    id: 'q7',
    question: 'What is the national animal of India?',
    options: ['Lion', 'Bengal Tiger', 'Elephant', 'Leopard'],
    correctIndex: 1,
  },
  {
    id: 'q8',
    question: 'Which day is celebrated as Republic Day?',
    options: ['15 August', '26 January', '2 October', '14 November'],
    correctIndex: 1,
  },
  {
    id: 'q9',
    question: 'Which organ pumps blood throughout the body?',
    options: ['Brain', 'Heart', 'Liver', 'Kidney'],
    correctIndex: 1,
  },
  {
    id: 'q10',
    question: 'How many bones are there in an adult human body?',
    options: ['200', '204', '206', '208'],
    correctIndex: 2,
  },

  // Level 2 – Easy to Medium
  {
    id: 'q11',
    question: 'What is the capital of Bihar?',
    options: ['Ranchi', 'Patna', 'Lucknow', 'Bhopal'],
    correctIndex: 1,
  },
  {
    id: 'q12',
    question: 'Which state has Jaipur as its capital?',
    options: ['Gujarat', 'Rajasthan', 'Punjab', 'Haryana'],
    correctIndex: 1,
  },
  {
    id: 'q13',
    question: 'What is the capital of Karnataka?',
    options: ['Mysuru', 'Bengaluru', 'Hubli', 'Mangaluru'],
    correctIndex: 1,
  },
  {
    id: 'q14',
    question: 'Which state is known as the "Land of Five Rivers"?',
    options: ['Haryana', 'Punjab', 'Rajasthan', 'Gujarat'],
    correctIndex: 1,
  },
  {
    id: 'q15',
    question: 'Which Union Territory is the capital of India?',
    options: ['Chandigarh', 'Delhi', 'Puducherry', 'Ladakh'],
    correctIndex: 1,
  },
  {
    id: 'q16',
    question: 'How many States are there in India?',
    options: ['27', '28', '29', '30'],
    correctIndex: 1,
  },
  {
    id: 'q17',
    question: 'How many Union Territories are there in India?',
    options: ['6', '7', '8', '9'],
    correctIndex: 2,
  },
  {
    id: 'q18',
    question: 'Which is the largest state of India by area?',
    options: ['Uttar Pradesh', 'Madhya Pradesh', 'Rajasthan', 'Maharashtra'],
    correctIndex: 2,
  },
  {
    id: 'q19',
    question: 'Which is the smallest state of India by area?',
    options: ['Goa', 'Sikkim', 'Tripura', 'Mizoram'],
    correctIndex: 0,
  },
  {
    id: 'q20',
    question: 'Which state is known as "God\'s Own Country"?',
    options: ['Tamil Nadu', 'Kerala', 'Karnataka', 'Goa'],
    correctIndex: 1,
  },

  // Level 3 – Medium
  {
    id: 'q21',
    question: 'Which of the following is an acid?',
    options: ['Sodium Hydroxide', 'Hydrochloric Acid', 'Lime Water', 'Soap Solution'],
    correctIndex: 1,
  },
  {
    id: 'q22',
    question: 'Blue litmus paper turns ______ in an acid.',
    options: ['Green', 'Yellow', 'Red', 'Blue'],
    correctIndex: 2,
  },
  {
    id: 'q23',
    question: 'Which substance is a base?',
    options: ['Vinegar', 'Lemon Juice', 'Sodium Hydroxide', 'Hydrochloric Acid'],
    correctIndex: 2,
  },
  {
    id: 'q24',
    question: 'Which of the following is a natural indicator?',
    options: ['Turmeric', 'Salt', 'Sugar', 'Sand'],
    correctIndex: 0,
  },
  {
    id: 'q25',
    question: 'Which process converts a solid directly into gas?',
    options: ['Evaporation', 'Melting', 'Sublimation', 'Condensation'],
    correctIndex: 2,
  },
  {
    id: 'q26',
    question: 'Which state of matter has a fixed shape?',
    options: ['Gas', 'Liquid', 'Solid', 'Plasma'],
    correctIndex: 2,
  },
  {
    id: 'q27',
    question: 'Which state of matter has neither fixed shape nor fixed volume?',
    options: ['Solid', 'Liquid', 'Gas', 'Ice'],
    correctIndex: 2,
  },
  {
    id: 'q28',
    question: 'Water changes into steam by:',
    options: ['Freezing', 'Evaporation', 'Condensation', 'Sublimation'],
    correctIndex: 1,
  },
  {
    id: 'q29',
    question: 'Which gas do plants absorb during photosynthesis?',
    options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
    correctIndex: 2,
  },
  {
    id: 'q30',
    question: 'Common salt is chemically known as:',
    options: ['NaOH', 'NaCl', 'HCl', 'CaCO₃'],
    correctIndex: 1,
  },

  // Level 4 – Medium to Hard
  {
    id: 'q31',
    question: 'Adolescence generally begins between:',
    options: ['5–8 years', '11–19 years', '20–25 years', '30–40 years'],
    correctIndex: 1,
  },
  {
    id: 'q32',
    question: 'Which gland secretes growth hormone?',
    options: ['Thyroid', 'Pituitary', 'Adrenal', 'Pancreas'],
    correctIndex: 1,
  },
  {
    id: 'q33',
    question: 'Which hormone regulates blood sugar?',
    options: ['Adrenaline', 'Thyroxine', 'Insulin', 'Estrogen'],
    correctIndex: 2,
  },
  {
    id: 'q34',
    question: 'Red Blood Cells carry:',
    options: ['Carbon Dioxide only', 'Oxygen', 'Water', 'Hormones'],
    correctIndex: 1,
  },
  {
    id: 'q35',
    question: 'Which blood cells help fight infection?',
    options: ['RBC', 'WBC', 'Platelets', 'Plasma'],
    correctIndex: 1,
  },
  {
    id: 'q36',
    question: 'Which vitamin is produced in our body when exposed to sunlight?',
    options: ['Vitamin A', 'Vitamin B12', 'Vitamin C', 'Vitamin D'],
    correctIndex: 3,
  },
  {
    id: 'q37',
    question: 'Which organ filters blood and forms urine?',
    options: ['Liver', 'Heart', 'Kidney', 'Lungs'],
    correctIndex: 2,
  },
  {
    id: 'q38',
    question: 'The largest organ in the human body is:',
    options: ['Liver', 'Brain', 'Skin', 'Lungs'],
    correctIndex: 2,
  },
  {
    id: 'q39',
    question: 'Which organ controls all body activities?',
    options: ['Heart', 'Brain', 'Kidney', 'Stomach'],
    correctIndex: 1,
  },
  {
    id: 'q40',
    question: 'Puberty is mainly controlled by:',
    options: ['Bones', 'Hormones', 'Muscles', 'Blood'],
    correctIndex: 1,
  },

  // Level 5 – Hard
  {
    id: 'q41',
    question: 'Who founded the Mauryan Empire?',
    options: ['Ashoka', 'Bindusara', 'Chandragupta Maurya', 'Harsha'],
    correctIndex: 2,
  },
  {
    id: 'q42',
    question: 'Who was the teacher and advisor of Chandragupta Maurya?',
    options: ['Aryabhata', 'Chanakya', 'Kalidasa', 'Panini'],
    correctIndex: 1,
  },
  {
    id: 'q43',
    question: "Which battle changed Emperor Ashoka's life?",
    options: ['Battle of Panipat', 'Battle of Haldighati', 'Kalinga War', 'Battle of Plassey'],
    correctIndex: 2,
  },
  {
    id: 'q44',
    question: 'Which religion did Ashoka promote after the Kalinga War?',
    options: ['Hinduism', 'Jainism', 'Buddhism', 'Sikhism'],
    correctIndex: 2,
  },
  {
    id: 'q45',
    question: 'Which organization declares World Heritage Sites?',
    options: ['WHO', 'ISRO', 'UNESCO', 'UNICEF'],
    correctIndex: 2,
  },
  {
    id: 'q46',
    question: 'Which of the following is a UNESCO World Heritage Site?',
    options: ['India Gate', 'Taj Mahal', 'Gateway of India', 'Charminar'],
    correctIndex: 1,
  },
  {
    id: 'q47',
    question: 'The Constitution of India came into force on:',
    options: ['15 August 1947', '26 November 1949', '26 January 1950', '2 October 1950'],
    correctIndex: 2,
  },
  {
    id: 'q48',
    question: 'Which is the highest civilian award in India?',
    options: ['Padma Shri', 'Bharat Ratna', 'Param Vir Chakra', 'Ashoka Chakra'],
    correctIndex: 1,
  },
  {
    id: 'q49',
    question: 'Which Indian scientist is known as the "Missile Man of India"?',
    options: ['Vikram Sarabhai', 'Homi Bhabha', 'A. P. J. Abdul Kalam', 'C. V. Raman'],
    correctIndex: 2,
  },
  {
    id: 'q50',
    question: "Which Indian mission successfully landed near the Moon's south pole?",
    options: ['Chandrayaan-1', 'Chandrayaan-2', 'Chandrayaan-3', 'Mangalyaan'],
    correctIndex: 2,
  },
];
