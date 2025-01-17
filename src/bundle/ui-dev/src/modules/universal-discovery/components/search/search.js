import React, { useState, useEffect, useReducer, useContext, createContext, useRef } from 'react';
import PropTypes from 'prop-types';

export const SelectedLanguageContext = createContext();
export const SelectedContentTypesContext = createContext();
export const SelectedSectionContext = createContext();
export const SelectedSubtreeContext = createContext();
export const SelectedSubtreeBreadcrumbsContext = createContext();

import Icon from '../../../common/icon/icon';
import ContentTable from '../content-table/content.table';
import Filters from '../filters/filters';
import SearchTags from './search.tags';
import { useSearchByQueryFetch } from '../../hooks/useSearchByQueryFetch';
import { AllowedContentTypesContext, SearchTextContext } from '../../universal.discovery.module';
import { createCssClassNames } from '../../../common/helpers/css.class.names';

const { Translator, ibexa } = window;

const selectedContentTypesReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_CONTENT_TYPE':
            return [...state, action.contentTypeIdentifier];
        case 'REMOVE_CONTENT_TYPE':
            return state.filter((contentTypeIdentifier) => contentTypeIdentifier !== action.contentTypeIdentifier);
        case 'CLEAR_CONTENT_TYPES':
            return [];
        default:
            throw new Error();
    }
};

const configLanguages = ibexa.adminUiConfig.languages;
const languages = configLanguages.priority.map((value) => {
    return configLanguages.mappings[value];
});

const Search = ({ itemsPerPage }) => {
    const allowedContentTypes = useContext(AllowedContentTypesContext);
    const [searchText] = useContext(SearchTextContext);
    const [offset, setOffset] = useState(0);
    const [selectedContentTypes, dispatchSelectedContentTypesAction] = useReducer(selectedContentTypesReducer, []);
    const [selectedSection, setSelectedSection] = useState('');
    const [selectedSubtree, setSelectedSubtree] = useState('');
    const [selectedSubtreeBreadcrumbs, setSelectedSubtreeBreadcrumbs] = useState('');
    const firstLanguageCode = languages.length ? languages[0].languageCode : '';
    const [selectedLanguage, setSelectedLanguage] = useState(firstLanguageCode);
    const prevSearchText = useRef(null);
    const [isLoading, data, searchByQuery] = useSearchByQueryFetch();
    const search = () => {
        const shouldResetOffset = prevSearchText.current !== searchText && offset !== 0;

        prevSearchText.current = searchText;

        if (shouldResetOffset) {
            setOffset(0);

            return;
        }

        const contentTypes = !!selectedContentTypes.length ? [...selectedContentTypes] : allowedContentTypes;

        searchByQuery(searchText, contentTypes, selectedSection, selectedSubtree, itemsPerPage, offset, selectedLanguage);
    };
    const changePage = (pageIndex) => setOffset(pageIndex * itemsPerPage);
    const renderCustomTableHeader = () => {
        const selectedLanguageName = ibexa.adminUiConfig.languages.mappings[selectedLanguage].name;
        const searchResultsTitle = Translator.trans(
            /*@Desc("Results for “%search_phrase%” (%total%)")*/ 'search.search_results',
            {
                search_phrase: searchText,
                total: data.count,
            },
            'universal_discovery_widget',
        );
        const searchResultsSubtitle = Translator.trans(
            /*@Desc("in %search_language%")*/ 'search.search_results.in_language',
            { search_language: selectedLanguageName },
            'universal_discovery_widget',
        );

        return (
            <>
                <div className="ibexa-table-header c-search__table-header">
                    <div className="ibexa-table-header__headline c-search__table-title">{searchResultsTitle}</div>
                    <div className="c-search__table-subtitle">{searchResultsSubtitle}</div>
                    <div className="c-search__search-tags">
                        <SearchTags />
                    </div>
                </div>
            </>
        );
    };
    const renderSearchResults = () => {
        if (data.count) {
            return (
                <ContentTable
                    count={data.count}
                    items={data.items}
                    itemsPerPage={itemsPerPage}
                    activePageIndex={offset ? offset / itemsPerPage : 0}
                    onPageChange={changePage}
                    renderCustomHeader={renderCustomTableHeader}
                />
            );
        } else if (!!data.items) {
            const noResultsLabel = Translator.trans(
                /*@Desc("No results found for %query%")*/ 'search.no_results',
                { query: searchText },
                'universal_discovery_widget',
            );
            const noResultsHints = [
                Translator.trans(
                    /*@Desc("Check the spelling of keywords.")*/ 'search.no_results.hint.check_spelling',
                    {},
                    'universal_discovery_widget',
                ),
                Translator.trans(
                    /*@Desc("Try more general keywords.")*/ 'search.no_results.hint.more_general',
                    {},
                    'universal_discovery_widget',
                ),
                Translator.trans(
                    /*@Desc("Try different keywords.")*/ 'search.no_results.hint.different_kewords',
                    {},
                    'universal_discovery_widget',
                ),
                Translator.trans(
                    /*@Desc("Try fewer keywords. Reducing keywords results in more matches.")*/ 'search.no_results.hint.fewer_keywords',
                    {},
                    'universal_discovery_widget',
                ),
            ];

            return (
                <div className="c-search__no-results">
                    <img className="" src="/bundles/ibexaadminui/img/no-results.svg" />
                    <h2 className="c-search__no-results-title">{noResultsLabel}</h2>
                    <div className="c-search__no-results-subtitle">
                        {noResultsHints.map((hint, key) => (
                            <div
                                key={key} // eslint-disable-line react/no-array-index-key
                                className="c-search__no-results-hint"
                            >
                                <div className="c-search__no-results-hint-icon-wrapper">
                                    <Icon name="approved" extraClasses="ibexa-icon--small-medium" />
                                </div>
                                <div className="c-search__no-results-hint-text">{hint}</div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
    };
    const spinnerWrapperClassName = createCssClassNames({
        'c-search__spinner-wrapper': true,
        'c-search__spinner-wrapper--show': isLoading,
    });

    useEffect(search, [searchText, offset]);

    return (
        <div className="c-search">
            <SelectedContentTypesContext.Provider value={[selectedContentTypes, dispatchSelectedContentTypesAction]}>
                <SelectedSectionContext.Provider value={[selectedSection, setSelectedSection]}>
                    <SelectedSubtreeContext.Provider value={[selectedSubtree, setSelectedSubtree]}>
                        <SelectedSubtreeBreadcrumbsContext.Provider value={[selectedSubtreeBreadcrumbs, setSelectedSubtreeBreadcrumbs]}>
                            <SelectedLanguageContext.Provider value={[selectedLanguage, setSelectedLanguage]}>
                                <div className="c-search__main">
                                    <div className="c-search__sidebar">
                                        <Filters isCollapsed={false} search={search} />
                                    </div>
                                    <div className="c-search__content">
                                        <div className={spinnerWrapperClassName}>
                                            <Icon name="spinner" extraClasses="ibexa-icon--medium ibexa-spin" />
                                        </div>
                                        {renderSearchResults()}
                                    </div>
                                </div>
                            </SelectedLanguageContext.Provider>
                        </SelectedSubtreeBreadcrumbsContext.Provider>
                    </SelectedSubtreeContext.Provider>
                </SelectedSectionContext.Provider>
            </SelectedContentTypesContext.Provider>
        </div>
    );
};

Search.propTypes = {
    itemsPerPage: PropTypes.number,
};

Search.defaultProps = {
    itemsPerPage: 50,
};

export default Search;
