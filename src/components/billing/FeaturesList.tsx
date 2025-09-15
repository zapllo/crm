import { Check } from "lucide-react";

export default function FeaturesList() {
  const features = [
    {
      title: "Contact Management",
      items: [
        "Unlimited contact storage",
        "Contact segmentation",
        "Custom fields & attributes",
        "Contact activity history",
      ],
    },
    {
      title: "Sales Pipeline",
      items: [
        "Drag & drop deal management",
        "Custom sales stages",
        "Sales forecasting",
        "Lead scoring & prioritization",
      ],
    },
    {
      title: "Communication Tools",
      items: [
        "Email integration",
        "WhatsApp business integration",
        "Email templates & scheduling",
        "Conversation tracking",
      ],
    },
    {
      title: "Analytics & Reporting",
      items: [
        "Customizable dashboards",
        "Performance metrics",
        "Export & share reports",
        "Real-time analytics",
      ],
    },
    {
      title: "Integration & Support",
      items: [
        "Priority customer support",
        "API access for custom integrations",
        "Mobile app access (iOS & Android)",
        "Regular feature updates",
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {features.map((category, index) => (
        <div key={index}>
          <h3 className="font-medium mb-2">{category.title}</h3>
          <ul className="space-y-2">
            {category.items.map((item, idx) => (
              <li key={idx} className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}