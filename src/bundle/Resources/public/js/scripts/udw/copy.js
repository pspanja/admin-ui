(function (global, doc, ibexa, React, ReactDOM, Translator) {
    const btns = doc.querySelectorAll('.ibexa-btn--udw-copy');
    const form = doc.querySelector('form[name="location_copy"]');
    const input = form.querySelector('#location_copy_new_parent_location');
    const udwContainer = doc.getElementById('react-udw');
    const closeUDW = () => ReactDOM.unmountComponentAtNode(udwContainer);
    const onConfirm = (items) => {
        closeUDW();

        input.value = items[0].id;
        form.submit();
    };
    const onCancel = () => closeUDW();
    const openUDW = (event) => {
        event.preventDefault();

        const config = JSON.parse(event.currentTarget.dataset.udwConfig);
        const title = Translator.trans(/*@Desc("Select Location")*/ 'copy.title', {}, 'universal_discovery_widget');

        ReactDOM.render(
            React.createElement(ibexa.modules.UniversalDiscovery, {
                onConfirm,
                onCancel,
                title,
                multiple: false,
                containersOnly: true,
                ...config,
            }),
            udwContainer,
        );
    };

    btns.forEach((btn) => btn.addEventListener('click', openUDW, false));
})(window, window.document, window.ibexa, window.React, window.ReactDOM, window.Translator);
