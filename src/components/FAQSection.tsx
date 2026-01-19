import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is this financial advice?",
    answer: "No. This is an educational simulation to visualize opportunity cost, not personalized financial advice or a prediction of future returns. Always consult with a qualified financial advisor for investment decisions."
  },
  {
    question: "What assumptions are you using?",
    answer: "The default assumes a 10% nominal annual return, which reflects historical S&P 500 averages with dividends reinvested. This is a rough illustration—actual returns vary significantly. When inflation-adjusted mode is enabled, we subtract the inflation rate from returns to show purchasing power growth instead of headline dollars."
  },
  {
    question: "Do you store my data?",
    answer: "No. All calculations run locally in your browser. Your expense data is not sent to any server, stored in any database, or shared with third parties. When you close the page, your inputs are gone."
  }
];

export function FAQSection() {
  return (
    <section className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-semibold text-foreground text-center">
        Frequently Asked Questions
      </h2>
      
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem 
            key={index} 
            value={`item-${index}`}
            className="border-border/50"
          >
            <AccordionTrigger className="text-left text-foreground hover:text-primary">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground leading-relaxed">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      
      <p className="text-center text-sm text-muted-foreground pt-4 border-t border-border/30">
        Past performance does not guarantee future results.
      </p>
    </section>
  );
}
