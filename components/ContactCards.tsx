interface ContactCard {
  label: string;
  value: string;
}

interface ContactCardsProps {
  cards: ContactCard[];
}

export default function ContactCards({ cards }: ContactCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-8">
      {cards.map((card) => (
        <div key={card.label}>
          <h3 className="font-bold text-gray-900 mb-3">{card.label}</h3>
          <div className="border border-gray-400 rounded-full px-6 py-2.5 text-sm text-gray-700 text-center">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
