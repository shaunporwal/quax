document.getElementById('parseBtn').addEventListener('click', function () {
    const fileInput = document.getElementById('w2file');
    const file = fileInput.files[0];
    const statusDiv = document.getElementById('status');

    if (!file) {
        statusDiv.innerText = "Select a PDF file.";
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const arrayBuffer = e.target.result;
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        loadingTask.promise.then(function (pdf) {
            pdf.getPage(1).then(function (page) {
                page.getTextContent().then(function (textContent) {
                    let fullText = "";
                    textContent.items.forEach(function (item) {
                        fullText += item.str + " ";
                    });
                    const wageMatch = fullText.match(/Wages, tips, other compensation[\s:]*\$?([\d,\.]+)/i);
                    const taxMatch = fullText.match(/Federal income tax withheld[\s:]*\$?([\d,\.]+)/i);
                    const w2Data = {
                        wages: wageMatch ? wageMatch[1] : "",
                        federalTax: taxMatch ? taxMatch[1] : ""
                    };
                    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                        chrome.tabs.sendMessage(tabs[0].id, { action: "fill_form", data: w2Data });
                    });
                    statusDiv.innerText = "W‑2 data processed and sent.";
                });
            });
        }, function (error) {
            statusDiv.innerText = "Error parsing PDF: " + error;
        });
    };
    reader.readAsArrayBuffer(file);
});
