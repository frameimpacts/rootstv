export default function FAQ() {
  const faqs = [
    {
      question: "What is RootsTV?",
      answer: "RootsTV is a streaming platform that offers a wide variety of movies, TV shows, and short films..."
    },
    {
      question: "How much does RootsTV cost?",
      answer: "We offer several subscription plans starting from..."
    },
    // Add more FAQs
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Frequently Asked Questions</h1>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-lg font-medium mb-2">{faq.question}</h2>
              <p className="text-gray-300">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 