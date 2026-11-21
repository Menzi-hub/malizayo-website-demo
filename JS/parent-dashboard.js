
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

        if (
            !learners ||
            learners.length !== learnerIds.length
        ) {

            throw new Error(
                "Some linked learner records could not be verified. Please contact the school."
            );

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
            "attendance",
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
