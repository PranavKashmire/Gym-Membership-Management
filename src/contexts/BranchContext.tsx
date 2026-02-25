import React, { createContext, useContext, useState } from 'react';
import { Branch } from '../types';
import { branches } from '../data/mockData';

interface BranchContextType {
    selectedBranch: Branch | null; // null = All Branches
    setSelectedBranch: (branch: Branch | null) => void;
    branches: Branch[];
}

const BranchContext = createContext<BranchContextType | null>(null);

export const BranchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

    return (
        <BranchContext.Provider value={{ selectedBranch, setSelectedBranch, branches }}>
            {children}
        </BranchContext.Provider>
    );
};

export const useBranch = () => {
    const ctx = useContext(BranchContext);
    if (!ctx) throw new Error('useBranch must be used within BranchProvider');
    return ctx;
};
