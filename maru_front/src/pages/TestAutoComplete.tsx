// src/components/AutoCompleteSearch.tsx
import React from 'react';
import { useAutoComplete } from '../hooks/useAutoComplete';

const ALL_ITEMS = ['apple', 'banana', 'coding', 'javascript', '원티드', '프리온보딩', '프론트엔드'];

// useAutoComplete 훅에 전달할 필터링 로직
const filterItems = (item: string, inputValue: string) =>
    item.toLowerCase().includes(inputValue.toLowerCase());

export const TestAutoCompleteSearch: React.FC = () => {
    const {
        isOpen,
        filteredItems,
        getInputProps,
        getItemProps,
        getResetButtonProps,
    } = useAutoComplete({
        items: ALL_ITEMS,
        filterFn: filterItems,
    });

    return (
        <div className="p-4 w-full max-w-xs mx-auto">
            <h1 className="text-2xl font-bold mb-4">AutoComplete</h1>
            <div className="relative">
                <div className={`flex items-center p-2 border border-gray-300 focus-within:shadow-lg ${isOpen ? 'rounded-t-lg' : 'rounded-lg'}`}>
                    <input
                        type="text"
                        className="flex-1 bg-transparent border-none outline-none"
                        placeholder="검색..."
                        {...getInputProps()}
                    />
                    <button
                        className="cursor-pointer text-gray-500"
                        {...getResetButtonProps()}
                    >
                        &times;
                    </button>
                </div>

                {isOpen && (
                    <ul className="absolute w-full mt-[-1px] bg-white border border-gray-300 rounded-b-lg shadow-lg list-none z-10">
                        {filteredItems.map((item, index) => (
                            <li
                                className="px-3 py-2 cursor-pointer hover:bg-gray-100 data-[active=true]:bg-gray-200"
                                {...getItemProps(index)}
                            >
                                {item}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};