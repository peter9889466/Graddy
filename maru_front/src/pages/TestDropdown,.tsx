// src/components/Dropdown.tsx
import React from 'react';
import { useDropdown } from '../hooks/useDropdown';

interface Item {
    id: number;
    label: string;
}

const items: Item[] = [
    { id: 1, label: '리액트' },
    { id: 2, label: '타입스크립트' },
    { id: 3, label: '테일윈드CSS' },
];

export const TestDropdown: React.FC = () => {
    const {
        isOpen,
        selectedIndex,
        getToggleButtonProps,
        getMenuProps,
        getItemProps
    } = useDropdown({
        items,
        onSelect: (item) => alert(`선택됨: ${item.label}`),
    });

    return (
        <div className="relative inline-block text-left w-48">
            <div>
                <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                    {...getToggleButtonProps()}
                >
                    옵션 선택
                </button>
            </div>

            {isOpen && (
                <ul
                    className="origin-top-right absolute right-0 mt-2 w-full rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    {...getMenuProps()}
                >
                    {items.map((item, index) => (
                        <li
                            key={item.id}
                            className={`block px-4 py-2 text-sm text-gray-700 cursor-pointer ${selectedIndex === index ? 'bg-gray-100' : ''
                                }`}
                            role="menuitem"
                            {...getItemProps(index)}
                        >
                            {item.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};