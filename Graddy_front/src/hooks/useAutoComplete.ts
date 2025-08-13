import { useState, useEffect, useMemo } from 'react';

interface UseAutoCompleteProps {
    suggestions: string[];
    maxSuggestions?: number;
}

export const useAutoComplete = ({ suggestions, maxSuggestions = 5 }: UseAutoCompleteProps) => {
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

    const filteredSuggestions = useMemo(() => {
        if (!inputValue.trim()) return [];

        return suggestions
            .filter(suggestion =>
                suggestion.toLowerCase().includes(inputValue.toLowerCase())
            )
            .slice(0, maxSuggestions);
    }, [inputValue, suggestions, maxSuggestions]);

    const handleInputChange = (value: string) => {
        setInputValue(value);
        setShowSuggestions(true);
        setActiveSuggestionIndex(-1);
    };

    const handleSuggestionClick = (suggestion: string) => {
        setInputValue(suggestion);
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || filteredSuggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveSuggestionIndex(prev =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveSuggestionIndex(prev =>
                    prev > 0 ? prev - 1 : filteredSuggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (activeSuggestionIndex >= 0) {
                    handleSuggestionClick(filteredSuggestions[activeSuggestionIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setActiveSuggestionIndex(-1);
                break;
        }
    };

    const hideSuggestions = () => {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
    };

    useEffect(() => {
        const handleClickOutside = () => {
            hideSuggestions();
        };

        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    return {
        inputValue,
        filteredSuggestions,
        showSuggestions,
        activeSuggestionIndex,
        handleInputChange,
        handleSuggestionClick,
        handleKeyDown,
        hideSuggestions,
        setInputValue
    };
};