
document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('memberTableBody');

    function createMemberRow(index) {
        const tr = document.createElement('tr');
        tr.classList.add('member-row');
        tr.innerHTML = `
            <td>${index}</td>
            <td><input class="form-control" title="Last Name" placeholder="Last Name"></td>
            <td><input class="form-control" title="First Name" placeholder="First Name"></td>
            <td><input class="form-control" title="Middle Name" placeholder="Middle Name"></td>
            <td><input class="form-control" title="Suffix" placeholder="(e.g Jr., Sr.)"></td>
            <td>
                <select class="form-select" title="Relation">
                    <option value="" disabled selected>Select</option>
                    <option value="1">1 - Head</option>
                    <option value="2">2 - Spouse</option>
                    <option value="3">3 - Son</option>
                    <option value="4">4 - Daughter</option>
                    <option value="5">5 - Others (specify)</option>
                </select>
            </td>
            <td>
                <select class="form-select" title="Sex">
                    <option value="" disabled selected>Select</option>
                    <option>F - Female</option>
                    <option>M - Male</option>
                </select>
            </td>
            <td><input class="form-control" title="Birthdate" type="date" placeholder="Enter Birthdate"></td>
            <td>
                <select class="form-select" title="Civil Status">
                    <option value="" disabled selected>Select</option>
                    <option>S - Single</option>
                    <option>M - Married</option>
                    <option>W - Widower</option>
                    <option>SP - Separated</option>
                    <option>C - Cohabitation</option>
                </select>
            </td>
            <td><input class="form-control" title="PhilHealth ID" placeholder="Enter PhilHealth ID"></td>
            <td>
                <select class="form-select" title="Membership">
                    <option value="" disabled selected>Select</option>
                    <option>M - Member</option>
                    <option>D - Dependent</option>
                </select>
            </td>
            <td>
                <select class="form-select" title="PhilHealth Category">
                    <option value="" disabled selected>Select</option>
                    <option>HPH - Hypertension</option>
                    <option>D - Diabetes</option>
                    <option>TB - Tuberculosis</option>
                    <option>S - Surgery</option>
                </select>
            </td>
            <td>
                <select class="form-select" title="Medical History">
                    <option value="" disabled selected>Select</option>
                    <option>HPH - Hypertension</option>
                    <option>D - Diabetes</option>
                    <option>TB - Tuberculosis</option>
                    <option>S - Surgery</option>
                </select>
            </td>
            <td>
                <select class="form-select" title="Using any FP Method?">
                    <option value="" disabled selected>Select</option>
                    <option>Y - Yes</option>
                    <option>N - No</option>
                </select>
            </td>
            <td>
                <div class="dropdown dropup">
                    <button class="btn btn-outline-secondary dropdown-toggle w-100" type="button"
                        data-bs-toggle="dropdown" aria-expanded="false">Select FP Method(s)</button>
                    <ul class="dropdown-menu p-2 dropdown-menu-scrollable">
                        ${['COC','POP','Injectable','Condom','LAM','BT2','Implant','BOM','DPT','Withdrawal','Others'].map(method => `
                            <li>
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" value="${method}" id="fp-${method.toLowerCase()}">
                                    <label class="form-check-label" for="fp-${method.toLowerCase()}">${method}</label>
                                </div>
                            </li>
                        `).join('')}
                    </ul>
                </div>
            </td>
            <td>
                <select class="form-select" title="FP Status">
                    <option value="" disabled selected>Select</option>
                    <option>NA - New Acceptor</option>
                    <option>CU - Current User</option>
                    <option>CM - Changing Method</option>
                    <option>CC - Changing Clinic</option>
                    <option>DP - Drop Out</option>
                    <option>R - Restarter</option>
                </select>
            </td>
            ${[1, 2, 3, 4].map(() => `
                <td><input class="form-control" title="Age" placeholder="Age"></td>
                <td><input class="form-control" title="Class" placeholder="Class"></td>
            `).join('')}
            <td>
                <select class="form-select" title="Educational Attainment">
                    <option value="" disabled selected>Select</option>
                    <option>N - None</option>
                    <option>K - Kinder</option>
                    <option>ES - Elementary Student</option>
                    <option>EU - Elementary Undergraduate</option>
                    <option>EG - Elementary Graduate</option>
                    <option>HS - High School Student</option>
                    <option>HU - High School Undergraduate</option>
                    <option>HG - High School Graduate</option>
                    <option>V - Vocational Course</option>
                    <option>CS - College Student</option>
                    <option>CU - College Undergraduate</option>
                    <option>CG - College Graduate</option>
                    <option>PQ - Postgraduate</option>
                </select>
            </td>
            <td>
                <select class="form-select" title="Religion">
                    <option value="" disabled selected>Select</option>
                    <option>Roman Catholic</option>
                    <option>Christian</option>
                    <option>INC</option>
                    <option>Catholic</option>
                    <option>Islam</option>
                    <option>Baptist</option>
                    <option>Born Again</option>
                    <option>Buddhism</option>
                    <option>Church of God</option>
                    <option>Jehovah's Witness</option>
                    <option>Protestant</option>
                    <option>Seventh Day Adventist</option>
                    <option>LDS - Mormons</option>
                    <option>Evangelical</option>
                    <option>Pentecostal</option>
                    <option>Unknown</option>
                    <option>Other</option>
                </select>
            </td>
            <td><input class="form-control" title="Remarks" placeholder="Enter Additional Info"></td>
        `;
        return tr;
    }

    function addMemberRowIfNeeded() {
        const rows = Array.from(tbody.querySelectorAll('.member-row'));
        const lastRow = rows[rows.length - 1];
    
        const inputs = lastRow.querySelectorAll('input, select');
        const hasInput = Array.from(inputs).some(field => {
            if (field.tagName === 'SELECT') {
                return field.value && field.value !== '';
            }
            return field.value.trim() !== '';
        });
    
        // Only add if the last row has any input
        if (hasInput) {
            const newIndex = rows.length + 1;
            const newRow = createMemberRow(newIndex);
            tbody.appendChild(newRow);
            attachInputListeners(newRow);
        }
    }
    function attachInputListeners(row) {
        const inputs = row.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', addMemberRowIfNeeded);
        });
    }

    // Initially add 2 rows
    for (let i = 1; i <= 2; i++) {
        const row = createMemberRow(i);
        tbody.appendChild(row);
        attachInputListeners(row);
    }
});
