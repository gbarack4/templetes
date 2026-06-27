export type InstructorReview = Readonly<{
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}>;

export const instructorReviews: Record<string, InstructorReview[]> = {
  "sarah-johnson": [
    {
      id: "review-sj-1",
      author: "Alex M.",
      rating: 5,
      comment: "Sarah was incredibly patient. I felt calm even during my first lesson on busy streets.",
      date: "2 weeks ago",
    },
    {
      id: "review-sj-2",
      author: "Jordan P.",
      rating: 5,
      comment: "Clear instructions and great at explaining parallel parking step by step.",
      date: "1 month ago",
    },
    {
      id: "review-sj-3",
      author: "Taylor R.",
      rating: 4,
      comment: "Very professional and punctual. Would have liked a bit more highway practice time.",
      date: "1 month ago",
    },
    {
      id: "review-sj-4",
      author: "Priya S.",
      rating: 5,
      comment: "She remembered exactly where we left off each week. Made progress feel steady and manageable.",
      date: "6 weeks ago",
    },
    {
      id: "review-sj-5",
      author: "Noah B.",
      rating: 5,
      comment: "Best instructor for nervous drivers. Never rushed me and always explained the why behind each maneuver.",
      date: "2 months ago",
    },
    {
      id: "review-sj-6",
      author: "Elena V.",
      rating: 5,
      comment: "Passed my test thanks to Sarah. Her mock test routes matched the real exam really closely.",
      date: "2 months ago",
    },
    {
      id: "review-sj-7",
      author: "Marcus T.",
      rating: 4,
      comment: "Friendly and knowledgeable. Scheduling was easy and she always arrived on time.",
      date: "3 months ago",
    },
    {
      id: "review-sj-8",
      author: "Hannah C.",
      rating: 5,
      comment: "I started as a complete beginner and Sarah built my confidence lesson by lesson. Highly recommend.",
      date: "3 months ago",
    },
    {
      id: "review-sj-9",
      author: "David F.",
      rating: 5,
      comment: "Great at night driving practice. Felt much safer on the road after just a few sessions.",
      date: "4 months ago",
    },
    {
      id: "review-sj-10",
      author: "Olivia G.",
      rating: 4,
      comment: "Very thorough with mirror checks and blind spots. Small details that made a big difference.",
      date: "5 months ago",
    },
  ],
  "mike-chen": [
    {
      id: "review-mc-1",
      author: "Chris L.",
      rating: 5,
      comment: "Mike helped me pass my road test on the first try. His test prep tips were spot on.",
      date: "3 weeks ago",
    },
    {
      id: "review-mc-2",
      author: "Sam K.",
      rating: 5,
      comment: "Structured lessons and honest feedback. I improved quickly with his defensive driving focus.",
      date: "2 months ago",
    },
    {
      id: "review-mc-3",
      author: "Riley N.",
      rating: 4,
      comment: "Great instructor overall. Sometimes a little fast-paced but very knowledgeable.",
      date: "2 months ago",
    },
    {
      id: "review-mc-4",
      author: "Aisha R.",
      rating: 5,
      comment: "Mike's lesson plans are well organized. Every session had a clear goal and we always hit it.",
      date: "6 weeks ago",
    },
    {
      id: "review-mc-5",
      author: "Ben W.",
      rating: 5,
      comment: "Excellent for road test prep. He knows exactly what examiners look for.",
      date: "2 months ago",
    },
    {
      id: "review-mc-6",
      author: "Sophie L.",
      rating: 4,
      comment: "Direct feedback but always constructive. My lane discipline improved a lot.",
      date: "3 months ago",
    },
    {
      id: "review-mc-7",
      author: "Kevin J.",
      rating: 5,
      comment: "Tough but fair. Pushed me to drive confidently in heavy traffic without cutting corners on safety.",
      date: "3 months ago",
    },
    {
      id: "review-mc-8",
      author: "Nina P.",
      rating: 5,
      comment: "Reliable, professional, and great at explaining right-of-way rules at tricky intersections.",
      date: "4 months ago",
    },
  ],
  "emma-williams": [
    {
      id: "review-ew-1",
      author: "Casey D.",
      rating: 5,
      comment: "Emma made learning to drive fun and less stressful. Perfect for nervous beginners.",
      date: "1 week ago",
    },
    {
      id: "review-ew-2",
      author: "Morgan H.",
      rating: 5,
      comment: "Flexible scheduling and always encouraging. My confidence improved after every lesson.",
      date: "3 weeks ago",
    },
    {
      id: "review-ew-3",
      author: "Jamie W.",
      rating: 5,
      comment: "Explains everything clearly and checks in often. One of the best instructors I've had.",
      date: "1 month ago",
    },
    {
      id: "review-ew-4",
      author: "Lucas M.",
      rating: 5,
      comment: "Emma worked around my school schedule without any hassle. Always positive and patient.",
      date: "5 weeks ago",
    },
    {
      id: "review-ew-5",
      author: "Zoe K.",
      rating: 5,
      comment: "She breaks complex maneuvers into simple steps. Reverse parking finally clicked for me.",
      date: "2 months ago",
    },
    {
      id: "review-ew-6",
      author: "Ethan D.",
      rating: 4,
      comment: "Very supportive instructor. Would have liked more focus on freeway merging but overall excellent.",
      date: "2 months ago",
    },
    {
      id: "review-ew-7",
      author: "Isabella N.",
      rating: 5,
      comment: "Kind, calm, and never made me feel bad about mistakes. Perfect for teen drivers.",
      date: "3 months ago",
    },
    {
      id: "review-ew-8",
      author: "Ryan O.",
      rating: 5,
      comment: "Emma's refresher lessons helped me get back on the road after years away. Felt safe the whole time.",
      date: "4 months ago",
    },
  ],
  "james-rodriguez": [
    {
      id: "review-jr-1",
      author: "Matt H.",
      rating: 5,
      comment: "James knows every tricky merge in Northgate. Highway lessons were exactly what I needed.",
      date: "2 weeks ago",
    },
    {
      id: "review-jr-2",
      author: "Sara Y.",
      rating: 4,
      comment: "Solid instructor with practical tips. Very good at explaining lane changes on busy roads.",
      date: "1 month ago",
    },
    {
      id: "review-jr-3",
      author: "Leo P.",
      rating: 5,
      comment: "Passed first time after training with James. His mock tests were tougher than the real one.",
      date: "2 months ago",
    },
  ],
  "lisa-patel": [
    {
      id: "review-lp-1",
      author: "Anya S.",
      rating: 5,
      comment: "Lisa is sharp and observant. She caught habits I didn't know I had and fixed them quickly.",
      date: "3 weeks ago",
    },
    {
      id: "review-lp-2",
      author: "Omar F.",
      rating: 5,
      comment: "Excellent for city driving. Capitol Hill routes prepared me for anything.",
      date: "1 month ago",
    },
    {
      id: "review-lp-3",
      author: "Grace T.",
      rating: 4,
      comment: "Professional and thorough. Sometimes intense but always fair and helpful.",
      date: "2 months ago",
    },
  ],
  "tom-anderson": [
    {
      id: "review-ta-1",
      author: "Will C.",
      rating: 5,
      comment: "Tom made parallel parking on narrow Ballard streets feel doable. Great teacher.",
      date: "1 week ago",
    },
    {
      id: "review-ta-2",
      author: "Kate M.",
      rating: 5,
      comment: "Easygoing style but still very focused on safety. Loved learning in my neighborhood.",
      date: "3 weeks ago",
    },
    {
      id: "review-ta-3",
      author: "Jake R.",
      rating: 4,
      comment: "Good value and flexible times. Parking drills were repetitive but really effective.",
      date: "2 months ago",
    },
  ],
  "nina-brooks": [
    {
      id: "review-nb-1",
      author: "Chloe A.",
      rating: 5,
      comment: "Nina is amazing with nervous teens. My daughter actually looked forward to every lesson.",
      date: "2 weeks ago",
    },
    {
      id: "review-nb-2",
      author: "Peter L.",
      rating: 5,
      comment: "Perfect for hill starts around Queen Anne. Clear, calm, and always on time.",
      date: "1 month ago",
    },
    {
      id: "review-nb-3",
      author: "Mia W.",
      rating: 5,
      comment: "Five stars for a reason. She explains everything twice if needed without ever sounding annoyed.",
      date: "6 weeks ago",
    },
  ],
  "david-kim": [
    {
      id: "review-dk-1",
      author: "Henry J.",
      rating: 5,
      comment: "David helped me understand US road signs coming from overseas. Very clear and patient.",
      date: "2 weeks ago",
    },
    {
      id: "review-dk-2",
      author: "Yuki N.",
      rating: 4,
      comment: "Great beginner instructor. Affordable rate and always prepared for each lesson.",
      date: "1 month ago",
    },
    {
      id: "review-dk-3",
      author: "Carlos V.",
      rating: 5,
      comment: "Reliable and friendly. Rainier Valley routes gave me confidence in all weather.",
      date: "2 months ago",
    },
  ],
};

export function getInstructorReviews(instructorId: string): InstructorReview[] {
  return instructorReviews[instructorId] ?? [];
}
