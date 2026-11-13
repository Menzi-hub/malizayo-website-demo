

/* =====================================
   MALIZAYO ADMIN DASHBOARD
   DEMONSTRATION JAVASCRIPT
===================================== */

(function () {

    // Find all sample applications

    const applicationRows =
        document.querySelectorAll(
            ".admin-table tbody tr"
        );


    const applicationsCount =
        document.getElementById("applicationsCount");

    const documentsCount =
        document.getElementById("documentsCount");

    const reviewedCount =
        document.getElementById("reviewedCount");

    const adminNotice =
        document.getElementById("adminNotice");


    // Update the summary cards

    function updateDashboardCounts() {

        let pendingDocuments = 0;

        let reviewedApplications = 0;

        applicationRows.forEach(function (row) {

            const documentStatus =
                row.cells[3].textContent.trim();

            const applicationStatus =
                row.querySelector(
                    "[data-application-status]"
                ).textContent.trim();


            if (documentStatus === "Documents Needed") {
                pendingDocuments++;
            }

            if (applicationStatus === "Approved") {
                reviewedApplications++;
            }

        });


        if (applicationsCount) {
            applicationsCount.textContent =
                applicationRows.length;
        }

        if (documentsCount) {
            documentsCount.textContent =
                pendingDocuments;
        }

        if (reviewedCount) {
            reviewedCount.textContent =
                reviewedApplications;
        }

    }


    // VIEW APPLICATION BUTTON

    document.querySelectorAll(
        ".view-application-btn"
    ).forEach(function (button) {

        button.addEventListener("click", function () {

            const row = button.closest("tr");

            const reference =
                row.dataset.application;

            const learner =
                row.cells[1].textContent;

            const grade =
                row.cells[2].textContent;

            const documents =
                row.cells[3].textContent;

            const status =
                row.querySelector(
                    "[data-application-status]"
                ).textContent.trim();


            alert(
                "SAMPLE APPLICATION DETAILS\n\n" +
                "Reference: " + reference + "\n" +
                "Learner: " + learner + "\n" +
                "Grade: " + grade + "\n" +
                "Documents: " + documents + "\n" +
                "Status: " + status + "\n\n" +
                "This is a fictional demonstration record."
            );

        });

    });


    // UPDATE APPLICATION STATUS

    document.querySelectorAll(
        ".update-status-btn"
    ).forEach(function (button) {

        button.addEventListener("click", function () {

            const row = button.closest("tr");

            const reference =
                row.dataset.application;

            const select =
                row.querySelector(".status-choice");

            const newStatus = select.value;

            const statusLabel =
                row.querySelector(
                    "[data-application-status]"
                );


            // Assign the correct status style

            const statusStyles = {

                "Pending Review": "status-pending",

                "Under Review": "status-review",

                "Approved": "status-approved",

                "Awaiting Documents": "status-documents"

            };


            statusLabel.textContent = newStatus;

            statusLabel.className =
                "status-pill " +
                statusStyles[newStatus];


            // Refresh dashboard figures

            updateDashboardCounts();


            // Show a confirmation

            adminNotice.textContent =
                reference + " status changed to " +
                newStatus +
                ". Demonstration only; changes are not saved.";

        });

    });


    // REPORT FILE CHECK

    const reportFile =
        document.getElementById("reportFile");

    const checkReportButton =
        document.getElementById("checkReportButton");

    const reportMessage =
        document.getElementById("reportMessage");


    if (reportFile && checkReportButton && reportMessage) {

        checkReportButton.addEventListener(
            "click",
            function () {

                const file = reportFile.files[0];


                if (!file) {

                    reportMessage.textContent =
                        "Please choose a sample report first.";

                    return;

                }


                const extension =
                    file.name.split(".").pop().toLowerCase();

                const allowedExtensions = [
                    "pdf",
                    "jpg",
                    "jpeg",
                    "png"
                ];


                if (!allowedExtensions.includes(extension)) {

                    reportMessage.textContent =
                        "Invalid format. Choose PDF, JPG or PNG.";

                    reportFile.value = "";

                    return;

                }


                const maximumSize =
                    5 * 1024 * 1024;


                if (file.size > maximumSize) {

                    reportMessage.textContent =
                        "The file exceeds the 5 MB limit.";

                    reportFile.value = "";

                    return;

                }


                reportMessage.textContent =
                    "File checks passed: " +
                    file.name +
                    ". No upload or storage has taken place.";

            }
        );

    }


  // Display initial summary figures

updateDashboardCounts();


/* =====================================
   MANAGE SCHOOL ANNOUNCEMENTS
===================================== */

const announcementForm =
    document.getElementById("announcementForm");

const announcementTitle =
    document.getElementById("announcementTitle");

const announcementCategory =
    document.getElementById("announcementCategory");

const announcementContent =
    document.getElementById("announcementContent");

const announcementMessage =
    document.getElementById("announcementMessage");

const adminAnnouncementList =
    document.getElementById("adminAnnouncementList");

const announcementStorageKey =
    "malizayoDemoAnnouncements";
   // Keep track of the announcement being edited
let editingAnnouncementId = null;


// Load saved demonstration announcements

function getAnnouncements() {

    try {

        const saved =
            localStorage.getItem(announcementStorageKey);

        return saved ? JSON.parse(saved) : [];

    } catch (error) {

        return [];

    }

}


// Save announcements in this browser

function saveAnnouncements(announcements) {

    localStorage.setItem(
        announcementStorageKey,
        JSON.stringify(announcements)
    );

}


// Display announcements in admin dashboard

function displayAdminAnnouncements() {

    if (!adminAnnouncementList) {
        return;
    }

    const announcements = getAnnouncements();

    adminAnnouncementList.replaceChildren();

    if (announcements.length === 0) {

        const emptyMessage =
            document.createElement("p");

        emptyMessage.textContent =
            "No announcements published yet.";

        adminAnnouncementList.appendChild(emptyMessage);

        return;

    }

    announcements.forEach(function (announcement) {

        const card =
            document.createElement("article");

        const heading =
            document.createElement("h4");

        const category =
            document.createElement("p");

        const content =
            document.createElement("p");

        const removeButton =
            document.createElement("button");


        heading.textContent = announcement.title;

        category.textContent = announcement.category;

        content.textContent = announcement.content;

        removeButton.textContent = "Remove Announcement";


        removeButton.addEventListener("click", function () {

            const updatedAnnouncements =
                getAnnouncements().filter(function (item) {

                    return item.id !== announcement.id;

                });

            saveAnnouncements(updatedAnnouncements);

            displayAdminAnnouncements();

        });


        card.appendChild(heading);

        card.appendChild(category);

        card.appendChild(content);

        card.appendChild(removeButton);

        adminAnnouncementList.appendChild(card);

    });

}


// Publish a new announcement

if (announcementForm) {

    announcementForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const title =
                announcementTitle.value.trim();

            const category =
                announcementCategory.value;

            const content =
                announcementContent.value.trim();


            if (!title || !category || !content) {

                announcementMessage.textContent =
                    "Please complete all announcement fields.";

                return;

            }


            const announcements = getAnnouncements();

            const newAnnouncement = {

                id: Date.now().toString(),

                title: title,

                category: category,

                content: content,

                date: new Date().toLocaleDateString("en-ZA")

            };


            announcements.unshift(newAnnouncement);

            try {

                saveAnnouncements(announcements);

                announcementMessage.textContent =
                    "Announcement published successfully in this browser.";

                announcementForm.reset();

                displayAdminAnnouncements();

            } catch (error) {

                announcementMessage.textContent =
                    "Unable to save the announcement in this browser.";

            }

        }
    );

}


// Show existing announcements when admin page opens

displayAdminAnnouncements();


})();
