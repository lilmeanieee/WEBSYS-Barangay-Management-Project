//ethnicity
const ipRadio = document.getElementById("ipHousehold");
const nonIpRadio = document.getElementById("nonIpHousehold");
const tribeContainer = document.getElementById("tribeContainer");

function toggleTribeInput() {
    if (ipRadio.checked) {
        tribeContainer.style.display = "block";
    } else {
        tribeContainer.style.display = "none";
        document.getElementById("tribeInput").value = ""; // clear value if hidden
    }
}

ipRadio.addEventListener("change", toggleTribeInput);
nonIpRadio.addEventListener("change", toggleTribeInput);


// socioeconomic status
const nhts_4psRadio = document.getElementById("NHTS4ps");
const nhts_Non4psRadio = document.getElementById("NHTS_Non-4ps");
const nonNhtsRadio = document.getElementById("Non-NHTS");
const nhtsContainer = document.getElementById("nhtsContainer");

function toggleNHTSInput() {
    if (nhts_4psRadio.checked|| nhts_Non4psRadio.checked) {
        nhtsContainer.style.display = "block";
    } else {
        nhtsContainer.style.display = "none";
        document.getElementById("nhtsInput").value = ""; // clear value if hidden
    }
}

nhts_4psRadio.addEventListener("change", toggleNHTSInput);
nhts_Non4psRadio.addEventListener("change", toggleNHTSInput);
nonNhtsRadio.addEventListener("change", toggleNHTSInput);



function toggleOtherInput(selectElement) {
    const otherContainer = document.getElementById("otherWaterSourceContainer");
    const otherInput = document.getElementById("otherWaterSourceInput");

    if (selectElement.value === "Others") {
        otherContainer.style.display = "block";
    } else {
        otherContainer.style.display = "none";
        otherInput.value = ""; // optional: clear input when hidden
    }
}