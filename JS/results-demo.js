

/* =========================================
   MALIZAYO SCHOOL RESULTS DEMONSTRATION
========================================= */

(function () {

    const STORAGE_KEY = "malizayo_demo_results_v1";


    // READ SAVED RESULTS

    function getResults() {

        try {

            const savedResults =
                localStorage.getItem(STORAGE_KEY);

            const results =
                savedResults ? JSON.parse(savedResults) : [];

            return Array.isArray(results) ? results : [];

        } catch (error) {

            return [];

        }

    }


    // ADMINISTRATOR: PUBLISH RESULTS

    const resultForm =
        document.getElementById("resultForm");

    if (resultForm) {

        const resultMessage =
            document.getElementById("resultMessage");

        resultForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const learner =
                document.getElementById("resultLearner").value;

            const subject =
                document.getElementById("resultSubject").value;

            const mark =
                Number(document.getElementById("resultMark").value);


            if (
                !learner ||
                !subject ||
                !Number.isFinite(mark) ||
                mark < 0 ||
                mark > 100
            ) {

                resultMessage.textContent =
                    "Please enter a valid learner, subject and mark.";

                return;

            }


            const results = getResults();

            results.push({

                learner: learner,

                subject: subject,

                mark: mark,

                term: "Demo Term"

            });


            try {

                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(results)
                );

            } catch (error) {

                resultMessage.textContent =
                    "Unable to save the demonstration result.";

                return;

            }


            resultMessage.textContent =
                "Sample result published successfully! " +
                "The parent portal can now display it.";

            resultForm.reset();

        });

    }


    // PARENT: DISPLAY PUBLISHED RESULTS

    const publishedResults =
        document.getElementById("publishedResults");

    if (publishedResults) {

        const results = getResults();

        const learnerResults =
            results.filter(function (result) {

                return result.learner === "Sample Learner A";

            });

        publishedResults.replaceChildren();


        if (learnerResults.length === 0) {

            const row = document.createElement("tr");

            const cell = document.createElement("td");

            cell.colSpan = 3;

            cell.textContent =
                "No new sample results have been published yet.";

            row.appendChild(cell);

            publishedResults.appendChild(row);

        }


        learnerResults.forEach(function (result) {

            const row = document.createElement("tr");

            const subjectCell =
                document.createElement("td");

            subjectCell.textContent = result.subject;


            const markCell =
                document.createElement("td");

            markCell.textContent = result.mark + "%";


            const progressCell =
                document.createElement("td");

            const progressBar =
                document.createElement("div");

            progressBar.className = "progress-bar";


            const progressFill =
                document.createElement("div");

            progressFill.style.width = result.mark + "%";

            progressBar.appendChild(progressFill);

            progressCell.appendChild(progressBar);

            row.appendChild(subjectCell);

            row.appendChild(markCell);

            row.appendChild(progressCell);

            publishedResults.appendChild(row);

        });

    }

})();
