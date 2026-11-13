

/* =====================================
   MALIZAYO ANNOUNCEMENTS DISPLAY
   DEMONSTRATION ONLY
===================================== */

(function () {

    const storageKey = "malizayoDemoAnnouncements";

    const announcementList =
        document.getElementById("publicAnnouncementList");

    if (!announcementList) {
        return;
    }

    function displayAnnouncements() {

        let announcements = [];

        try {

            announcements = JSON.parse(
                localStorage.getItem(storageKey) || "[]"
            );

        } catch (error) {

            announcements = [];

        }

        announcementList.replaceChildren();

        if (announcements.length === 0) {

            const message = document.createElement("p");

            message.textContent =
                "No new announcements have been published.";

            announcementList.appendChild(message);

            return;

        }

        announcements.forEach(function (announcement) {

            const card = document.createElement("article");

            card.className = "announcement-card";

            const category = document.createElement("span");

            category.className = "announcement-date";

            category.textContent = announcement.category;

            const heading = document.createElement("h3");

            heading.textContent = announcement.title;

            const content = document.createElement("p");

            content.textContent = announcement.content;

            card.appendChild(category);

            card.appendChild(heading);

            card.appendChild(content);

            announcementList.appendChild(card);

        });

    }

    displayAnnouncements();

})();
