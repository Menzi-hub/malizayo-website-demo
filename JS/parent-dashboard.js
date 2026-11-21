
/* =========================================
   MALIZAYO PRIMARY SCHOOL
   LIVE PARENT DASHBOARD
   LEARNER PROFILE CONNECTION
========================================= */

(function () {

    "use strict";

    const db = window.malizayoSupabase;

    if (!db) {
        console.error(
            "Parent dashboard: Supabase connection unavailable."
        );
        return;
    }


    // =====================================
    // SAFE TEXT ELEMENT CREATION
    // =====================================

    function createTextElement(tag, className, text) {

        const element =
            document.createElement(tag);

        if (className) {
            element.className = className;
        }

        element.textContent = text || "";

        return element;

    }


    // =====================================
    // LOAD AUTHENTICATED PARENT'S DATA
    // =====================================

    window.loadParentDashboard = async function (
        expectedUserId
    ) {

        // VERIFY CURRENT AUTHENTICATED USER

        const {
            data: userData,
            error: userError
        } = await db.auth.getUser();

        if (
            userError ||
            !userData.user ||
            userData.user.id !== expectedUserId
        ) {

            throw new Error(
                "Parent authentication could not be verified."
            );

        }


        // =====================================
        // LOAD PARENT PROFILE
        // =====================================

        const {
            data: parent,
            error: parentError
        } = await db
            .from("parent_profiles")
            .select("user_id, full_name")
            .eq("user_id", expectedUserId)
            .maybeSingle();


        if (parentError) {
            throw parentError;
        }

        if (!parent) {

            throw new Error(
                "Your registered parent profile could not be found."
            );

        }


        // =====================================
        // LOAD PARENT-LEARNER LINKS
        // =====================================

        const {
            data: links,
            error: linksError
        } = await db
            .from("parent_learners")
            .select(
                "learner_id, relationship_to_learner"
            )
            .eq("parent_user_id", expectedUserId);


        if (linksError) {
            throw linksError;
        }

        if (!links || links.length === 0) {

            throw new Error(
                "No learner is currently linked to your account."
            );

        }


        // =====================================
        // LOAD ONLY LINKED LEARNERS
        // RLS ALSO PROTECTS THIS QUERY
        // =====================================

        const learnerIds = [
            ...new Set(
                links.map(link => link.learner_id)
            )
        ];

        const {
            data: learners,
            error: learnersError
        } = await db
            .from("learners")
            .select(
                "id, admission_number, full_name, grade, class_name, learner_status"
            )
            .in("id", learnerIds)
            .order("full_name");


        if (learnersError) {
            throw learnersError;
        }

        
// =====================================
// LOAD PUBLISHED ACADEMIC RESULTS
// RLS RESTRICTS RESULTS TO LINKED LEARNERS
// =====================================

const {
    data: academicResults,
    error: academicResultsError
} = await db
    .from("academic_results")
    .select(`
        id,
        learner_id,
        academic_year,
        term,
        subject,
        assessment_name,
        mark_obtained,
        total_marks,
        teacher_comment
    `)
    .in("learner_id", learnerIds)
    .eq("is_published", true)
    .order("academic_year", { ascending: false })
    .order("term", { ascending: false })
    .order("subject", { ascending: true });

if (academicResultsError) {
    throw academicResultsError;
}



        // =====================================
        // UPDATE PARENT HEADER
        // =====================================

        const dashboard =
            document.getElementById("parentDashboard");

        if (!dashboard) {

            throw new Error(
                "Parent dashboard could not be found."
            );

        }

        const header =
            dashboard.querySelector(".parent-header");

        if (header) {

            const welcomeBlock =
                header.querySelectorAll(":scope > div")[0];

            if (welcomeBlock) {

                const welcomeMessage =
                    welcomeBlock.querySelector(
                        "p:not(.parent-small-heading)"
                    );

                if (welcomeMessage) {

                    welcomeMessage.textContent =
                        "Welcome back, " + parent.full_name;

                }

            }

            const accountName =
                header.querySelector(
                    ".parent-account strong"
                );

            const accountType =
                header.querySelector(
                    ".parent-account p"
                );

            const avatar =
                header.querySelector(".parent-avatar");


            if (accountName) {

                accountName.textContent =
                    parent.full_name;

            }

            if (accountType) {

                accountType.textContent =
                    "Parent Account";

            }

            if (avatar) {

                const initials = parent.full_name
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map(part => part.charAt(0).toUpperCase())
                    .join("");

                avatar.textContent = initials;

            }

        }


        // =====================================
        // UPDATE LINKED LEARNER SUMMARY
        // =====================================

        const summary =
            dashboard.querySelector(".parent-summary");

        if (summary) {

            summary.replaceChildren();

            const card =
                createTextElement(
                    "div",
                    "parent-stat",
                    ""
                );

            card.appendChild(
                createTextElement(
                    "span",
                    "",
                    "Linked Learners"
                )
            );

            card.appendChild(
                createTextElement(
                    "h2",
                    "",
                    String(learners.length)
                )
            );

            card.appendChild(
                createTextElement(
                    "p",
                    "",
                    "Verified school learner records"
                )
            );

            summary.appendChild(card);

        }


        // =====================================
        // UPDATE LEARNER PROFILES
        // =====================================

        const learnerSection =
            document.getElementById("learner");

        if (!learnerSection) {

            throw new Error(
                "Learner profile section could not be found."
            );

        }

// =====================================
// LOAD PUBLISHED ATTENDANCE RECORDS
// ONLY FOR LINKED LEARNERS
// =====================================

const {
    data: attendanceRecords,
    error: attendanceError
} = await db
    .from("attendance_records")
    .select(`
        id,
        learner_id,
        attendance_date,
        status,
        parent_note
    `)
    .in("learner_id", learnerIds)
    .eq("is_published", true)
    .order("attendance_date", {
        ascending: false
    });

if (attendanceError) {
    throw attendanceError;
}

        learnerSection.replaceChildren();


        const heading =
            createTextElement(
                "div",
                "parent-panel-heading",
                ""
            );

        heading.appendChild(
            createTextElement(
                "h2",
                "",
                learners.length === 1
                    ? "My Learner"
                    : "My Learners"
            )
        );

        heading.appendChild(
            createTextElement(
                "span",
                "",
                "Live School Records"
            )
        );

        learnerSection.appendChild(heading);


        // DISPLAY EACH LINKED LEARNER

        learners.forEach(function (learner) {

            const profile =
                createTextElement(
                    "div",
                    "learner-profile",
                    ""
                );


            // LEARNER INITIALS

            const avatar =
                createTextElement(
                    "div",
                    "learner-avatar",
                    learner.full_name
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map(part =>
                            part.charAt(0).toUpperCase()
                        )
                        .join("")
                );

            profile.appendChild(avatar);


            // LEARNER DETAILS

            const details =
                createTextElement(
                    "div",
                    "learner-details",
                    ""
                );

            details.appendChild(
                createTextElement(
                    "h3",
                    "",
                    learner.full_name
                )
            );

            details.appendChild(
                createTextElement(
                    "p",
                    "",
                    learner.grade
                )
            );

            details.appendChild(
                createTextElement(
                    "p",
                    "",
                    "Admission Number: " +
                        learner.admission_number
                )
            );

            details.appendChild(
                createTextElement(
                    "p",
                    "",
                    "Class: " +
                        (learner.class_name || "Not assigned")
                )
            );

            details.appendChild(
                createTextElement(
                    "p",
                    "",
                    "School: Malizayo Primary School"
                )
            );

            profile.appendChild(details);


            // LEARNER STATUS

            profile.appendChild(
                createTextElement(
                    "span",
                    "learner-status",
                    learner.learner_status
                )
            );

            learnerSection.appendChild(profile);

        });

// =====================================
// DISPLAY LIVE ATTENDANCE HISTORY
// =====================================

const attendanceSection =
    document.getElementById("attendance");

if (!attendanceSection) {
    throw new Error(
        "Attendance section could not be found."
    );
}

attendanceSection.replaceChildren();


// SECTION HEADING

const attendanceHeading =
    createTextElement(
        "div",
        "parent-panel-heading",
        ""
    );

attendanceHeading.appendChild(
    createTextElement(
        "h2",
        "",
        "Attendance History"
    )
);

attendanceHeading.appendChild(
    createTextElement(
        "span",
        "",
        "Published School Records"
    )
);

attendanceSection.appendChild(attendanceHeading);


// ATTENDANCE TABLE

const attendanceWrapper =
    document.createElement("div");

attendanceWrapper.className =
    "academic-table-wrapper";

const attendanceTable =
    document.createElement("table");

attendanceTable.className =
    "academic-table";

const attendanceHead =
    document.createElement("thead");

const attendanceHeaderRow =
    document.createElement("tr");

[
    "Learner",
    "Date",
    "Status",
    "Note from School"
].forEach(function (headingText) {

    attendanceHeaderRow.appendChild(
        createTextElement(
            "th",
            "",
            headingText
        )
    );

});

attendanceHead.appendChild(attendanceHeaderRow);

const attendanceBody =
    document.createElement("tbody");


// MATCH LEARNER IDS TO THEIR NAMES

const attendanceLearnerMap = new Map(
    learners.map(learner => [
        learner.id,
        learner.full_name
    ])
);


// HANDLE NO ATTENDANCE RECORDS

if (
    !attendanceRecords ||
    attendanceRecords.length === 0
) {

    const row =
        document.createElement("tr");

    const cell =
        document.createElement("td");

    cell.colSpan = 4;

    cell.textContent =
        "No published attendance records are available yet.";

    row.appendChild(cell);

    attendanceBody.appendChild(row);

}


// DISPLAY ATTENDANCE RECORDS

(attendanceRecords || []).forEach(function (record) {

    const row =
        document.createElement("tr");


    // LEARNER NAME

    row.appendChild(
        createTextElement(
            "td",
            "",
            attendanceLearnerMap.get(record.learner_id) ||
                "Linked Learner"
        )
    );


    // ATTENDANCE DATE

    const date =
        new Date(
            record.attendance_date + "T00:00:00"
        );

    const formattedDate =
        Number.isNaN(date.getTime())
            ? record.attendance_date
            : date.toLocaleDateString("en-ZA");


    row.appendChild(
        createTextElement(
            "td",
            "",
            formattedDate
        )
    );


    // STATUS

    row.appendChild(
        createTextElement(
            "td",
            "",
            record.status
        )
    );


    // NOTE

    row.appendChild(
        createTextElement(
            "td",
            "",
            record.parent_note ||
                "No additional note"
        )
    );


    attendanceBody.appendChild(row);

});


attendanceTable.appendChild(attendanceHead);

attendanceTable.appendChild(attendanceBody);

attendanceWrapper.appendChild(attendanceTable);

attendanceSection.appendChild(attendanceWrapper);


// INFORMATION NOTE

attendanceSection.appendChild(
    createTextElement(
        "p",
        "document-note",
        "Attendance information is provided by Malizayo Primary School."
    )
);


// SHOW ATTENDANCE SECTION

attendanceSection.hidden = false;

const attendanceNavigationLink =
    dashboard.querySelector(
        '.parent-navigation a[href="#attendance"]'
    );

if (attendanceNavigationLink) {
    attendanceNavigationLink.hidden = false;
}


// =====================================
// DISPLAY LIVE ACADEMIC RESULTS
// =====================================

const progressSection =
    document.getElementById("progress");

if (!progressSection) {
    throw new Error(
        "Academic progress section could not be found."
    );
}

progressSection.replaceChildren();

const progressHeading =
    createTextElement(
        "div",
        "parent-panel-heading",
        ""
    );

progressHeading.appendChild(
    createTextElement(
        "h2",
        "",
        "Academic Progress"
    )
);

progressHeading.appendChild(
    createTextElement(
        "span",
        "",
        "Published School Results"
    )
);

progressSection.appendChild(progressHeading);


// CREATE RESULTS TABLE

const progressWrapper =
    document.createElement("div");

progressWrapper.className =
    "academic-table-wrapper";

const resultsTable =
    document.createElement("table");

resultsTable.className =
    "academic-table";

const resultsHead =
    document.createElement("thead");

const headerRow =
    document.createElement("tr");

[
    "Learner",
    "Year",
    "Term",
    "Subject",
    "Assessment",
    "Mark",
    "Progress",
    "Teacher Comment"
].forEach(function (headingText) {

    headerRow.appendChild(
        createTextElement(
            "th",
            "",
            headingText
        )
    );

});

resultsHead.appendChild(headerRow);

const resultsBody =
    document.createElement("tbody");


// MAP LEARNER IDS TO NAMES

const learnerNameMap = new Map(
    learners.map(learner => [
        learner.id,
        learner.full_name
    ])
);


// HANDLE NO PUBLISHED RESULTS

if (
    !academicResults ||
    academicResults.length === 0
) {

    const row =
        document.createElement("tr");

    const cell =
        document.createElement("td");

    cell.colSpan = 8;

    cell.textContent =
        "No academic results have been published for your linked learners yet.";

    row.appendChild(cell);

    resultsBody.appendChild(row);

}


// DISPLAY PUBLISHED RESULTS

(academicResults || []).forEach(function (result) {

    const row =
        document.createElement("tr");

    const mark =
        Number(result.mark_obtained);

    const total =
        Number(result.total_marks);

    const percentage =
        (mark / total) * 100;

    const formattedMark =
        mark.toLocaleString("en-ZA", {
            maximumFractionDigits: 2
        });

    const formattedTotal =
        total.toLocaleString("en-ZA", {
            maximumFractionDigits: 2
        });

    const formattedPercentage =
        percentage.toLocaleString("en-ZA", {
            maximumFractionDigits: 1
        });


    // LEARNER

    row.appendChild(
        createTextElement(
            "td",
            "",
            learnerNameMap.get(result.learner_id) ||
                "Linked Learner"
        )
    );


    // YEAR

    row.appendChild(
        createTextElement(
            "td",
            "",
            String(result.academic_year)
        )
    );


    // TERM

    row.appendChild(
        createTextElement(
            "td",
            "",
            "Term " + result.term
        )
    );


    // SUBJECT

    row.appendChild(
        createTextElement(
            "td",
            "",
            result.subject
        )
    );


    // ASSESSMENT

    row.appendChild(
        createTextElement(
            "td",
            "",
            result.assessment_name
        )
    );


    // MARK

    row.appendChild(
        createTextElement(
            "td",
            "",
            formattedMark + " / " + formattedTotal
        )
    );


    // PROGRESS BAR

    const progressCell =
        document.createElement("td");

    const progressBar =
        document.createElement("div");

    progressBar.className = "progress-bar";

    const progressFill =
        document.createElement("div");

    progressFill.style.width =
        Math.min(100, Math.max(0, percentage)) + "%";

    progressBar.appendChild(progressFill);

    progressCell.appendChild(progressBar);

    progressCell.appendChild(
        createTextElement(
            "span",
            "",
            formattedPercentage + "%"
        )
    );

    row.appendChild(progressCell);


    // TEACHER COMMENT

    row.appendChild(
        createTextElement(
            "td",
            "",
            result.teacher_comment ||
                "No comment provided"
        )
    );


    resultsBody.appendChild(row);

});


resultsTable.appendChild(resultsHead);

resultsTable.appendChild(resultsBody);

progressWrapper.appendChild(resultsTable);

progressSection.appendChild(progressWrapper);


progressSection.appendChild(
    createTextElement(
        "p",
        "document-note",
        "Only academic results published by Malizayo Primary School are displayed."
    )
);


// SHOW ACADEMIC PROGRESS SECTION

progressSection.hidden = false;

const progressNavigationLink =
    dashboard.querySelector(
        '.parent-navigation a[href="#progress"]'
    );

if (progressNavigationLink) {
    progressNavigationLink.hidden = false;
}


        // =====================================
        // REMOVE FICTIONAL INFORMATION
        // =====================================

        const demoNotice =
            dashboard.querySelector(
                ".parent-demo-notice"
            );

        if (demoNotice) {
            demoNotice.remove();
        }


        // Hide sections that are not yet connected
        // to live school database records.

       const unfinishedSections = [
    "progress",
    "reports",
    "announcements",
    "admissions"
];

        unfinishedSections.forEach(function (id) {

            const section =
                document.getElementById(id);

            if (section) {
                section.hidden = true;
            }

            const navigationLink =
                dashboard.querySelector(
                    '.parent-navigation a[href="#' + id + '"]'
                );

            if (navigationLink) {
                navigationLink.hidden = true;
            }

        });


        // =====================================
        // UPDATE SIDEBAR
        // =====================================

        const sidebarFooter =
            dashboard.querySelector(
                ".parent-sidebar-footer"
            );

        if (sidebarFooter) {

            sidebarFooter.textContent =
                "Secure Parent Account";

        }


        // =====================================
        // UPDATE FOOTER
        // =====================================

        const footer =
            dashboard.querySelector(".parent-footer");

        if (footer) {

            footer.replaceChildren();

            footer.appendChild(
                createTextElement(
                    "strong",
                    "",
                    "Malizayo Primary School"
                )
            );

            footer.appendChild(
                createTextElement(
                    "p",
                    "",
                    "Private Parent Portal. Learner information is restricted to authorised linked accounts."
                )
            );

        }


        console.log(
            "Parent dashboard loaded successfully.",
            {
                linkedLearnerCount: learners.length
            }
        );


        return {
            parent: parent,
            learners: learners
        };

    };


})();
