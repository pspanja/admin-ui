import React, { useState, useEffect, useRef } from 'react';

import Icon from '../icon/icon';

import { createCssClassNames } from '../helpers/css.class.names';
import Dropdown from '../dropdown/dropdown';

const languages = Object.values(window.ibexa.adminUiConfig.languages.mappings);
const contentTypes = Object.entries(window.ibexa.adminUiConfig.contentTypes);

const ContentCreateWidget = ({
    dropdownListRef,
    createContent,
    close,
    isVisible,
    parentLocation,
    allowedContentTypes,
    allowedLanguages,
    preselectedLanguage,
    preselectedContentType,
    tooltipContainerSelector,
}) => {
    const refContentTree = useRef(null);
    const filteredLanguages = languages.filter((language) => {
        const userHasPermission =
            !parentLocation ||
            !parentLocation.permissions ||
            !parentLocation.permissions.create.restrictedLanguageCodes.length ||
            parentLocation.permissions.create.restrictedLanguageCodes.includes(language.languageCode);
        const isAllowedLanguage = !allowedLanguages || allowedLanguages.includes(language.languageCode);

        return userHasPermission && isAllowedLanguage && language.enabled;
    });
    const [filterQuery, setFilterQuery] = useState('');
    const firstLanguageCode = filteredLanguages.length ? filteredLanguages[0].languageCode : '';
    const [selectedLanguage, setSelectedLanguage] = useState(preselectedLanguage || firstLanguageCode);
    const [selectedContentType, setSelectedContentType] = useState(preselectedContentType);
    const createContentWrapper = () => {
        createContent({ selectedLanguage, selectedContentType });
    }
    const updateFilterQuery = (event) => {
        const query = event.target.value.toLowerCase();

        setFilterQuery(query);
    };
    const updateSelectedLanguage = (value) => setSelectedLanguage(value);
    const isConfirmDisabled = !selectedContentType || !selectedLanguage || parentLocation?.parentLocationId === 1;
    const createContentLabel = Translator.trans(/*@Desc("Create new content")*/ 'create_content.label', {}, 'universal_discovery_widget');
    const selectLanguageLabel = Translator.trans(
        /*@Desc("Select a language")*/ 'create_content.select_language',
        {},
        'universal_discovery_widget',
    );
    const selectContentType = Translator.trans(
        /*@Desc("Select a Content Type")*/ 'create_content.select_content_type',
        {},
        'universal_discovery_widget',
    );
    const createLabel = Translator.trans(/*@Desc("Create new")*/ 'create_content.create', {}, 'universal_discovery_widget');
    const closeLabel = Translator.trans(/*@Desc("Close")*/ 'popup.close.label', {}, 'universal_discovery_widget');
    const cancelLabel = Translator.trans(/*@Desc("Cancel")*/ 'content_create.cancel.label', {}, 'universal_discovery_widget');
    const placeholder = Translator.trans(/*@Desc("Type to refine")*/ 'content_create.placeholder', {}, 'universal_discovery_widget');
    const filtersDescLabel = Translator.trans(
        /*@Desc("Or choose from list")*/ 'content.create.filters.desc',
        {},
        'universal_discovery_widget',
    );
    const createUnderLabel = Translator.trans(
        /*@Desc("under %content_name%")*/ 'content.create.editing_details',
        { content_name: parentLocation?.location?.ContentInfo.Content.TranslatedName },
        'universal_discovery_widget',
    );
    const widgetClassName = createCssClassNames({
        'ibexa-extra-actions': true,
        'ibexa-extra-actions--create': true,
        'ibexa-extra-actions--hidden': !isVisible,
        'c-content-create': true,
    });
    const languageOptions = languages
        .filter((language) => language.enabled)
        .map((language) => ({
            value: language.languageCode,
            label: language.name,
        }));

    useEffect(() => {
        window.ibexa.helpers.tooltips.parse(refContentTree.current);
    }, []);

    return (
        <div className="ibexa-extra-actions-container">
            <div className="ibexa-extra-actions-container__backdrop" hidden={!isVisible} onClick={close}></div>
            <div className={widgetClassName} ref={refContentTree}>
                <div className="ibexa-extra-actions__header">
                    <h3>{createContentLabel}</h3>
                    <button
                        type="button"
                        className="btn ibexa-btn ibexa-btn--ghost ibexa-btn--no-text ibexa-btn--close"
                        onClick={close}
                        title={closeLabel}
                        data-tooltip-container-selector={tooltipContainerSelector}
                    >
                        <Icon name="discard" extraClasses="ibexa-icon--small" />
                    </button>
                    <div className="ibexa-extra-actions__header-subtitle">{createUnderLabel}</div>
                </div>
                <div className="ibexa-extra-actions__content">
                    <label className="ibexa-label ibexa-extra-actions__section-header">{selectLanguageLabel}</label>
                    <div className="ibexa-extra-actions__section-content">
                        <Dropdown
                            dropdownListRef={dropdownListRef}
                            onChange={updateSelectedLanguage}
                            single={true}
                            value={selectedLanguage}
                            options={languageOptions}
                            extraClasses="c-udw-dropdown"
                        />
                    </div>
                    <label className="ibexa-label ibexa-extra-actions__section-header">{selectContentType}</label>
                    <div className="ibexa-extra-actions__section-content ibexa-extra-actions__section-content--content-type">
                        <div className="ibexa-instant-filter">
                            <div className="ibexa-instant-filter__input-wrapper">
                                <input
                                    autoFocus
                                    className="ibexa-instant-filter__input ibexa-input ibexa-input--text form-control"
                                    type="text"
                                    placeholder={placeholder}
                                    onChange={updateFilterQuery}
                                />
                            </div>
                        </div>
                        <div className="ibexa-instant-filter__desc">{filtersDescLabel}</div>
                        <div className="ibexa-instant-filter__items">
                            {contentTypes.map(([groupName, groupItems]) => {
                                const restrictedContentTypeIds = parentLocation?.permissions?.create.restrictedContentTypeIds ?? [];
                                const isHidden = groupItems.every((groupItem) => {
                                    const isNotSearchedName = filterQuery && !groupItem.name.toLowerCase().includes(filterQuery);
                                    const hasNotPermission =
                                        restrictedContentTypeIds.length && !restrictedContentTypeIds.includes(groupItem.id.toString());
                                    const isNotAllowedContentType =
                                        allowedContentTypes && !allowedContentTypes.includes(groupItem.identifier);
                                    const isHiddenByConfig = groupItem.isHidden;

                                    return isNotSearchedName || hasNotPermission || isNotAllowedContentType || isHiddenByConfig;
                                });

                                if (isHidden) {
                                    return null;
                                }

                                return (
                                    <div className="ibexa-instant-filter__group" key={groupName}>
                                        <div className="ibexa-instant-filter__group-name">{groupName}</div>
                                        {groupItems.map(({ name, thumbnail, identifier, id, isHidden: isHiddenByConfig }) => {
                                            const isHidden =
                                                isHiddenByConfig ||
                                                (filterQuery && !name.toLowerCase().includes(filterQuery)) ||
                                                (parentLocation &&
                                                    parentLocation.permissions &&
                                                    parentLocation.permissions.create.restrictedContentTypeIds.length &&
                                                    !parentLocation.permissions.create.restrictedContentTypeIds.includes(
                                                        id.toString(),
                                                    )) ||
                                                (allowedContentTypes && !allowedContentTypes.includes(identifier));
                                            const className = createCssClassNames({
                                                'ibexa-instant-filter__group-item': true,
                                                'ibexa-instant-filter__group-item--selected': identifier === selectedContentType,
                                            });
                                            const updateSelectedContentType = () => setSelectedContentType(identifier);

                                            if (isHidden) {
                                                return null;
                                            }

                                            return (
                                                <div
                                                    hidden={isHidden}
                                                    key={identifier}
                                                    className={className}
                                                    onClick={updateSelectedContentType}
                                                >
                                                    <Icon customPath={thumbnail} extraClasses="ibexa-icon--small" />
                                                    <div className="form-check">
                                                        <div className="ibexa-label ibexa-label--checkbox-radio form-check-label">
                                                            {name}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="c-content-create__confirm-wrapper">
                    <button
                        className="c-content-create__confirm-button btn ibexa-btn ibexa-btn--primary"
                        onClick={createContentWrapper}
                        disabled={isConfirmDisabled}
                    >
                        {createLabel}
                    </button>
                    <button className="btn ibexa-btn ibexa-btn--secondary" onClick={close}>
                        {cancelLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

ContentCreateWidget.propTypes = {
    dropdownListRef: PropTypes.object.isRequired,
    createContent: PropTypes.func.isRequired,
    close: PropTypes.func.isRequired,
    parentLocation: PropTypes.object.isRequired,
    tooltipContainerSelector: PropTypes.string.isRequired,
    isVisible: PropTypes.bool,
    allowedContentTypes: PropTypes.array,
    allowedLanguages: PropTypes.array,
    preselectedLanguage: PropTypes.string,
    preselectedContentType: PropTypes.string,
};

ContentCreateWidget.defautlProps = {
    isVisible: false,
    allowedContentTypes: null,
    allowedLanguages: null,
    preselectedLanguage: null,
    preselectedContentType: null,
}

export default ContentCreateWidget;
