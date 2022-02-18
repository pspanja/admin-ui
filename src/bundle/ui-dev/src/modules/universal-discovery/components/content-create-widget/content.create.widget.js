import React, { useContext } from 'react';

import ContentCreateWidgetCommon from '../../../common/content-create-widget/content.create.widget';
import {
    DropdownPortalRefContext,
    CreateContentWidgetContext,
    ActiveTabContext,
    ContentOnTheFlyDataContext,
    MarkedLocationIdContext,
    LoadedLocationsMapContext,
    ContentOnTheFlyConfigContext,
    AllowedContentTypesContext,
} from '../../universal.discovery.module';

const ContentCreateWidget = () => {
    const dropdownListRef = useContext(DropdownPortalRefContext);
    const [markedLocationId, setMarkedLocationId] = useContext(MarkedLocationIdContext);
    const [loadedLocationsMap, dispatchLoadedLocationsAction] = useContext(LoadedLocationsMapContext);
    const { allowedLanguages, preselectedLanguage, preselectedContentType } = useContext(ContentOnTheFlyConfigContext);
    const allowedContentTypes = useContext(AllowedContentTypesContext);
    const parentLocation = loadedLocationsMap.find((loadedLocation) => loadedLocation.parentLocationId === markedLocationId);
    const [activeTab, setActiveTab] = useContext(ActiveTabContext);
    const [createContentVisible, setCreateContentVisible] = useContext(CreateContentWidgetContext);
    const [contentOnTheFlyData, setContentOnTheFlyData] = useContext(ContentOnTheFlyDataContext);
    const close = () => {
        setCreateContentVisible(false);
    };
    const createContent = ({ selectedLanguage, selectedContentType }) => {
        setContentOnTheFlyData({
            locationId: markedLocationId,
            languageCode: selectedLanguage,
            contentTypeIdentifier: selectedContentType,
        });
        setActiveTab('content-create');
    };

    return (
        <ContentCreateWidgetCommon
            dropdownListRef={dropdownListRef}
            createContent={createContent}
            close={close}
            isVisible={createContentVisible}
            parentLocation={parentLocation}
            allowedContentTypes={allowedContentTypes}
            allowedLanguages={allowedLanguages}
            preselectedLanguage={preselectedLanguage}
            preselectedContentType={preselectedContentType}
            tooltipContainerSelector=".c-udw-tab"
        />
    );
};

export default ContentCreateWidget;
