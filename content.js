chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "fill_form") {
        document.querySelectorAll("input").forEach(function (input) {
            const lowerName = input.name.toLowerCase();
            if (lowerName.includes("wage") || lowerName.includes("compensation")) {
                input.setAttribute("placeholder", request.data.wages);
            }
            if (lowerName.includes("tax")) {
                input.setAttribute("placeholder", request.data.federalTax);
            }
        });
    }
});
