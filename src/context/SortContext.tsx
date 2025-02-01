import React, { createContext, useContext, ReactNode, useState } from "react";
import { SortType } from "@/utils/types";

interface SortContextType {
  selectedSort: SortType;
  setSelectedSort: (sortType: SortType) => void;
}

const SortContext = createContext<SortContextType | undefined>(undefined);

interface SortProviderProps {
  children: ReactNode;
}

export const SortProvider: React.FC<SortProviderProps> = ({ children }) => {
  const [selectedSort, setSelectedSortState] = useState<SortType>(
    SortType.MostPopular,
  );

  const setSelectedSort = (sortType: SortType) => {
    setSelectedSortState(sortType);
  };

  return (
    <SortContext.Provider value={{ selectedSort, setSelectedSort }}>
      {children}
    </SortContext.Provider>
  );
};

export const useSort = () => {
  const context = useContext(SortContext);
  if (!context) {
    throw new Error("useSort must be used within a SortProvider");
  }
  return context;
};
