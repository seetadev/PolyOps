// Params
const urlSearchParams = new URLSearchParams(window.location.search);
var params = Object.fromEntries(urlSearchParams.entries());

// Prepare Data
var domains = {};

// UD
domains.unstoppabledomains = [
    '.crypto',
    '.zil',
    '.coin',
    '.wallet',
    '.bitcoin',
    '.x',
    '.888',
    '.nft',
    '.dao',
    '.blockchain'
];

// Start App
$(() => {

    // Exist Domain
    if (typeof params.d === 'string' && params.d.length > 0) {

        // Direct Domain
        if (

            // Bitcoin
            params.d.startsWith('bitcoin:')

        ) {
            location.href = params.d;
        }

        // Steam Store
        else if (params.d.startsWith('https://store.steampowered.com/app/')) {
            const appID = params.d.split('/')[4];
            location.href = 'steam://store/' + appID;
        }

        // Others
        else {

            // Domain
            const domain = params.d.split('/');

            // Start Load Page
            $.LoadingOverlay("show", { background: "rgba(0,0,0, 0.5)", text: `Loading ${domain[0]}` });

            // Get Custom Proxy
            if (localStorage && localStorage.getItem) {

                // Get Custom Proxy
                const customCIDProxy = localStorage.getItem('customCIDProxy');
                if (typeof customCIDProxy === 'string' && customCIDProxy.length > 0) {
                    tinyProxy.url = customCIDProxy;
                }

            }

            // Domain DNS Selected
            let dns = null;
            for (const where in domains) {
                for (const item in domains[where]) {
                    if (domain[0].endsWith(domains[where][item])) {
                        dns = where;
                        break;
                    }
                }
            }

            // Exist DNS
            if (dns) {

                // DNS Mode
                if (typeof params.currency !== 'string' || params.currency.length < 1) {
                    readDomainData(domain[0], 'ipfsHash').then(cid => {
                        domain.shift();
                        document.location.href = tinyProxy.url.replace('{cid}', cid.data).replace('{cid32}', CIDTool.base32(cid.data)) + domain.join('/');
                    }).catch(err => {
                        console.error(err);
                        alert(err.message);
                        $.LoadingOverlay("hide");
                        document.location.href = '/';
                    });
                }

                // Wallet Mode
                else {

                    // Choose Type
                    let typeAction = 'addr';
                    if (typeof params.chain === 'string' && params.chain.length > 0) {
                        typeAction = 'multiChainAddr';
                    }

                    // Action
                    readDomainData(domain[0], typeAction, params.currency, params.chain)

                    // Complete
                    .then(address => {

                        // QR Code
                        const qrcodeCanvas = $('<canvas>');
                        qrcode.toCanvas(qrcodeCanvas[0], address.data, function(error) {
                            if (error) { alert(error) } else {

                                // Prepare Text
                                qrcodeCanvas.addClass('mt-5');
                                const textData = [
                                    $('<span>').text(domain[0]),
                                    $('<span>', { class: 'badge badge-secondary ml-2' }).text(params.currency.toLocaleUpperCase())
                                ];

                                // Exist Chain Value
                                if (params.chain) {
                                    textData.push($('<span>', { class: 'badge badge-secondary ml-2' }).text(params.chain.toLocaleUpperCase()));
                                }

                                // Set Body
                                $('body').append(
                                    $('<center>', { class: 'container my-5' }).append(

                                        $('<h3>', { class: 'mb-4' }).append(textData),

                                        $('<input>', { class: 'form-control text-center' }).attr('readonly', true).val(address.data).click(function() {
                                            $(this).select();
                                        }),

                                        qrcodeCanvas

                                    )
                                )

                                // Show Page
                                $.LoadingOverlay("hide");

                            }
                        });

                    })

                    // Error
                    .catch(err => {
                        console.error(err);
                        alert(err.message);
                        $.LoadingOverlay("hide");
                        document.location.href = '/';
                    });
                }
            }

            // Invalid
            else {
                alert('Invalid DNS Server!');
                $.LoadingOverlay("hide");
                document.location.href = '/';
            }

        }

    }

    // Homepage
    else { startHomepage(); }

});

// Start Homepage
const startHomepage = function() {

    // Start Homepage
    /* $('body').append(



    ); */

    // Temp Redirect
    document.location.href = 'https://github.com/JasminDreasond/Dohpw';

};