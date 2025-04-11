//adding residents
$(document).ready(function () {

    function calculateAge(birthdate) {
        const birth = new Date(birthdate);
        const today = new Date();
        
        // Calculate years
        let ageYears = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            ageYears--;
        }
        
        // For infants (less than 1 year old), calculate age in months
        if (ageYears === 0) {
            let ageMonths = today.getMonth() - birth.getMonth();
            if (today.getDate() < birth.getDate()) {
                ageMonths--;
            }
            // If negative months due to birth date being later in the current month
            if (ageMonths < 0) {
                ageMonths += 12;
            }
            
            // You could store this information in a separate field
            $("#age_months").val(ageMonths);
            // Or you could display it in the UI
            // $("#age_display").text(ageMonths + " month(s)");
        }
        
        return ageYears;
    }
    $("#birthdate").on("change", function () {
        const birthdate = $(this).v ();
        if (birthdate) {
            // Convert input date format if needed
            let birth;
            if (birthdate.match(/^\d{2}\/\d{2}\/\d{4}$/) || birthdate.match(/^\d{2}\/\d{1}\/\d{4}$/) || 
                birthdate.match(/^\d{1}\/\d{2}\/\d{4}$/) || birthdate.match(/^\d{1}\/\d{1}\/\d{4}$/)) {
                // Handle various DD/MM/YYYY formats
                const parts = birthdate.split('/');
                birth = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            } else {
                birth = new Date(birthdate);
            }
            
            // Check if date is valid
            if (isNaN(birth.getTime())) {
                console.error("Invalid date format:", birthdate);
                return;
            }
            
            const today = new Date();
            
            // Calculate years
            let ageYears = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
                ageYears--;
            }
            
            // Calculate months for infants
            let ageMonths = 0;
            if (ageYears === 0) {
                ageMonths = today.getMonth() - birth.getMonth();
                if (today.getDate() < birth.getDate()) {
                    ageMonths--;
                }
                // If negative months due to birth date being later in the current month
                if (ageMonths < 0) {
                    ageMonths += 12;
                }
            }
            
            // Set values in form fields - using val() to update the input values
            $("#age").val(ageYears);
            
            if (ageYears === 0) {
                $("#age_months").val(ageMonths);
                $("#age_months").parent().show();
            } else {
                $("#age_months").val(0);
                $("#age_months").parent().hide();
            }
            
            // Debug output
            console.log(`Calculated age: ${ageYears} years, ${ageMonths} months`);
        }
    });

    $("#btn_submit").click(function (event) {
        event.preventDefault(); // Prevent form refresh

        // Collect form data including the new fields
        let residentData = {
            last_name: $("#last_name").val(),
            first_name: $("#first_name").val(),
            middle_name: $("#middle_name").val(), // New field
            suffix: $("#suffix").val(), // New field
            birthdate: $("#birthdate").val(),
            age: $("#age").val(),
            age_months: ageYears === 0 ? $("#age_months").val() : 0,
            nationality: $("#nationality").val(), //birthplace
            gender: $("#gender").val(),
            
            
            civil_status: $("#civil_status").val(),
            religion: $("#religion").val(),
            occupation: $("#occupation").val(),
            
            // Address Information - normalized
            house_lot_no: $("#house_lot_no").val(),
            purok: $("#purok").val(),
            street: $("#street").val(),
            subdivision: $("#subdivision").val(),
            barangay: $("#barangay").val(),
            city_municipality: $("#city_municipality").val(),
            province: $("#province").val(),
            region: $("#region").val(),

            // Contact Information
            mobile_no: $("#mobile_no").val(),
            email_address: $("#email_address").val(),

            // Emergency Contact
            emergency_name: $("#emergency_name").val(),
            emergency_contact_num: $("#emergency_contact_num").val(),
            emergency_relationship: $("#emergency_relationship").val(),

            confirm: false // Default: Not confirming yet
        };

        
        // Debug: Log the Resident Data being sent
        console.log("Resident Data being sent:", JSON.stringify(residentData, null, 2));
        
        // Validate age data
        if (parseInt(residentData.age) < 0) {
            showToast("Invalid age. Please check the birthdate format.", true);
            return;
        }

        $.ajax({
            url: "http://localhost/Brgy-Ligaya-Management-Systemased-/handlers_php/add-residents.php?action=addResident",
            type: "POST",
            data: JSON.stringify(residentData),
            contentType: "application/json",
            success: function (response) {
                console.log("Success:", response);
                
                if (response.success) {
                    showToast("Resident added successfully!");
                    
                    // Reset form
                    document.getElementById("residentForm").reset();
                    
                    
                    
                } else if (response.warning) {
                    if (confirm(response.warning + "\nDo you want to proceed?")) {
                        residentData.confirm = true;
                        sendResidentData(residentData);
                    }
                } else {
                    showToast("Error adding resident", true);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error:", error);
                console.log("Response Text:", xhr.responseText);
                showToast("Error adding resident", true);
            }
        });
    });

    function sendResidentData(data) {
        $.ajax({
            url: "http://localhost/Web-based-Brgy-Ligaya-Management-System-main/handlers_php/add-residents.php?action=addResident",
            type: "POST",
            data: JSON.stringify(data),
            contentType: "application/json",
            success: function (response) {
                if (response.success) {
                    showToast("Resident added successfully!");
                    document.getElementById("residentForm").reset();

                    fetchResidents();
                  
                } else {
                    showToast("Error adding resident", true);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error:", error);
                showToast("Error adding resident", true);
            }
        });
    }

    

    function showToast(message, isError = false) {
        var toastElement = $("#toastMessage");
        $("#toastText").text(message);
        toastElement.removeClass("bg-success bg-danger").addClass(isError ? "bg-danger" : "bg-success");
        toastElement.toast("show");
    }
});
