"use client";

import { motion } from "framer-motion";
import { FaSadTear, FaFire, FaSeedling } from "react-icons/fa";
import clsx from "clsx";

export type SongStyle = "sad" | "savage" | "healing";

interface StyleSelectorProps {
  selected: SongStyle;
  onChange: (style: SongStyle) => void;
}

const styles = [
  {
    id: "sad" as SongStyle,
    name: "Sad",
    icon: FaSadTear,
    description: "Pour your heart out",
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-400",
  },
  {
    id: "savage" as SongStyle,
    name: "Savage",
    icon: FaFire,
    description: "Unleash your rage",
    color: "from-red-500 to-orange-600",
    bgColor: "bg-red-50",
    borderColor: "border-red-400",
  },
  {
    id: "healing" as SongStyle,
    name: "Healing",
    icon: FaSeedling,
    description: "Find your peace",
    color: "from-green-400 to-emerald-600",
    bgColor: "bg-green-50",
    borderColor: "border-green-400",
  },
];

export function StyleSelector({ selected, onChange }: StyleSelectorProps) {
  return (
    <div className="space-y-4">
      <label className="block text-lg font-semibold text-gray-700">
        Choose Your Vibe
      </label>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {styles.map((style) => {
          const Icon = style.icon;
          const isSelected = selected === style.id;
          
          return (
            <motion.button
              key={style.id}
              onClick={() => onChange(style.id)}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={clsx(
                "p-6 rounded-2xl border-2 transition-all duration-300 text-left",
                isSelected
                  ? `${style.bgColor} ${style.borderColor} shadow-lg`
                  : "bg-white border-gray-200 hover:border-gray-300 shadow-md"
              )}
            >
              <div className="flex flex-col items-center space-y-3">
                <div
                  className={clsx(
                    "p-4 rounded-full bg-gradient-to-br",
                    style.color
                  )}
                >
                  <Icon className="text-3xl text-white" />
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-lg text-gray-900">
                    {style.name}
                  </h3>
                  <p className="text-sm text-gray-600">{style.description}</p>
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
