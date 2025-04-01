"use client";

import { useState } from "react";
import Footer from "../components/Footer";
import { FAQSection, GetQuote, HowToOrder, ServicesWarranty } from "@/app/components/SupportComponents";

// Define the type for the options
interface Option {
  label: string;
  content: JSX.Element;
}

export default function Support() {
  const options: Option[] = [
    { label: "FAQ", content: <FAQSection /> },
    { label: "How to Order", content: <HowToOrder /> },
    { label: "How to Get a Quote", content: <GetQuote /> },
    { label: "Videos", content: <p>Video is Loading until enjoy free service</p> },
    { label: "Services & Warranty", content: <ServicesWarranty /> },
  ];

  const [selectedOption, setSelectedOption] = useState<Option>(options[0]);

  return (
    <>
      <div className="flex flex-col md:flex-row w-full min-h-screen">
        <aside className="md:w-1/4 border-r p-4 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">Support</h2>
          <nav>
            <ul className="space-y-2">
              {options.map((option) => (
                <li
                  key={option.label}
                  className={`p-2 cursor-pointer rounded-md ${
                    selectedOption.label === option.label
                      ? "bg-orange-200"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => setSelectedOption(option)}
                >
                  {option.label}
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        <main className="md:w-3/4 p-6">
          <h2 className="text-2xl font-bold mb-4">{selectedOption.label}</h2>
          <div className="prose max-w-full">
            {selectedOption.content}
            {selectedOption.label === "FAQ" && <></>}
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}