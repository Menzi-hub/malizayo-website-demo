

/* =====================================
   MALIZAYO PARENT PORTAL
   DEMONSTRATION JAVASCRIPT
===================================== */

(function () {

    // Find the download button

    const downloadButton =
        document.getElementById("downloadReport");

    const downloadMessage =
        document.getElementById("reportDownloadMessage");


    // Check that the elements exist

    if (downloadButton && downloadMessage) {

        downloadButton.addEventListener(
            "click",
            function () {

                // Create fictional report information

                const sampleReport =

                    "MALIZAYO PRIMARY SCHOOL\n" +
                    "SAMPLE LEARNER REPORT\n\n" +

                    "Learner: Sample Learner A\n" +
                    "Grade: 5\n" +
                    "Report: Demonstration Term Report\n\n" +

                    "ACADEMIC RESULTS\n\n" +

                    "Mathematics: 78%\n" +
                    "English: 72%\n" +
                    "isiZulu: 81%\n" +
                    "Natural Sciences: 69%\n\n" +

                    "Average: 75%\n" +
                    "Attendance: 92%\n\n" +

                    "IMPORTANT:\n" +
                    "This is fictional demonstration information.\n" +
                    "It is not an official school report.\n";


                // Create a downloadable file

                const reportBlob = new Blob(
                    [sampleReport],
                    { type: "text/plain;charset=utf-8" }
                );


                const downloadURL =
                    URL.createObjectURL(reportBlob);


                const link =
                    document.createElement("a");

                link.href = downloadURL;

                link.download =
                    "Malizayo-Sample-Learner-Report.txt";


                // Start the download

                document.body.appendChild(link);

                link.click();

                link.remove();


                // Release the temporary file URL

                setTimeout(function () {

                    URL.revokeObjectURL(downloadURL);

                }, 1000);


                downloadMessage.textContent =
                    "Your fictional sample report has been downloaded.";

            }
        );

    }

})();
