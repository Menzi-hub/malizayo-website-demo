

/* =====================================
   MALIZAYO PRIMARY SCHOOL WEBSITE
   MAIN JAVASCRIPT FILE
===================================== */

(function () {

    // Prevent this file from initializing twice
    if (window.__malizayoScriptInitialized) {
        return;
    }

    window.__malizayoScriptInitialized = true;


    /* =====================================
       1. MOBILE NAVIGATION MENU
    ===================================== */

    const menuButton =
        document.getElementById("menuButton");

    const navigation =
        document.getElementById("navigation");

    if (menuButton && navigation) {

        menuButton.addEventListener("click", function () {

            navigation.classList.toggle("show");

            const isOpen =
                navigation.classList.contains("show");

            menuButton.setAttribute(
                "aria-expanded",
                isOpen
            );

        });

        navigation.querySelectorAll("a").forEach(function (link) {

            link.addEventListener("click", function () {

                navigation.classList.remove("show");

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });

    }


    /* =====================================
       2. CONTACT FORM
    ===================================== */

    const contactForm =
        document.getElementById("contactForm");

    if (contactForm) {

        contactForm.addEventListener("submit", function (event) {

            event.preventDefault();

            alert(
                "Thank you for contacting Malizayo Primary School. " +
                "This is a demonstration form. Messages are not yet sent."
            );

            contactForm.reset();

        });

    }


    /* =====================================
       3. ONLINE ADMISSION FORM
    ===================================== */

    const admissionForm =
        document.getElementById("admissionForm");

    if (admissionForm) {

        const signatureCanvas =
            document.getElementById("signaturePad");

        const clearButton =
            document.getElementById("clearSignature");

        const signatureStatus =
            document.getElementById("signatureStatus");

        const message =
            document.getElementById("admissionMessage");


        // Check that all required elements exist

        if (
            signatureCanvas &&
            clearButton &&
            signatureStatus &&
            message
        ) {

            const context =
                signatureCanvas.getContext("2d");

            if (context) {

                let drawing = false;

                let hasSignature = false;


                // Signature appearance

                context.strokeStyle = "#173B5C";

                context.lineWidth = 3;

                context.lineCap = "round";

                context.lineJoin = "round";


                /* =====================================
                   4. GET MOUSE OR FINGER POSITION
                ===================================== */

                function getPosition(event) {

                    const rectangle =
                        signatureCanvas.getBoundingClientRect();

                    return {

                        x:
                            (event.clientX - rectangle.left) *
                            (signatureCanvas.width / rectangle.width),

                        y:
                            (event.clientY - rectangle.top) *
                            (signatureCanvas.height / rectangle.height)

                    };

                }


                /* =====================================
                   5. START DRAWING
                ===================================== */

                function startDrawing(event) {

                    event.preventDefault();

                    drawing = true;

                    signatureCanvas.setPointerCapture(
                        event.pointerId
                    );

                    const position = getPosition(event);

                    context.beginPath();

                    context.moveTo(
                        position.x,
                        position.y
                    );

                    context.lineTo(
                        position.x + 0.5,
                        position.y + 0.5
                    );

                    context.stroke();

                    hasSignature = true;

                    signatureStatus.textContent =
                        "Signature added.";

                }


                /* =====================================
                   6. CONTINUE DRAWING
                ===================================== */

                function drawSignature(event) {

                    if (!drawing) {
                        return;
                    }

                    event.preventDefault();

                    const position = getPosition(event);

                    context.lineTo(
                        position.x,
                        position.y
                    );

                    context.stroke();

                }


                /* =====================================
                   7. STOP DRAWING
                ===================================== */

                function stopDrawing() {

                    drawing = false;

                    context.beginPath();

                }


                // Connect the drawing events

                signatureCanvas.addEventListener(
                    "pointerdown",
                    startDrawing
                );

                signatureCanvas.addEventListener(
                    "pointermove",
                    drawSignature
                );

                signatureCanvas.addEventListener(
                    "pointerup",
                    stopDrawing
                );

                signatureCanvas.addEventListener(
                    "pointercancel",
                    stopDrawing
                );


                /* =====================================
                   8. CLEAR SIGNATURE
                ===================================== */

                clearButton.addEventListener("click", function () {

                    context.clearRect(
                        0,
                        0,
                        signatureCanvas.width,
                        signatureCanvas.height
                    );

                    hasSignature = false;

                    signatureStatus.textContent =
                        "No signature yet.";

                });


                /* =====================================
                   9. SUBMIT ADMISSION DEMONSTRATION
                ===================================== */

                admissionForm.addEventListener(
                    "submit",
                    function (event) {

                        event.preventDefault();


                        // Check the signature

                        if (!hasSignature) {

                            alert(
                                "Please draw your signature before submitting."
                            );

                            return;

                        }


                        // Check uploaded documents

                        const documentInputs =
                            admissionForm.querySelectorAll(
                                'input[type="file"]'
                            );

                        const maximumFileSize =
                            5 * 1024 * 1024;

                        for (const input of documentInputs) {

                            const file = input.files[0];

                            if (!file) {
                                continue;
                            }

                            const extension =
                                file.name.split(".").pop().toLowerCase();

                            const allowedExtensions = [
                                "pdf",
                                "jpg",
                                "jpeg",
                                "png"
                            ];


                            // Check file type

                            if (!allowedExtensions.includes(extension)) {

                                alert(
                                    "Please select PDF, JPG or PNG."
                                );

                                input.value = "";

                                return;

                            }


                            // Check file size

                            if (file.size > maximumFileSize) {

                                alert(
                                    "The document must not exceed 5 MB."
                                );

                                input.value = "";

                                return;

                            }

                        }


                        // Display confirmation

                        message.style.display = "block";

                        message.textContent =
                            "Demonstration successful! " +
                            "Your signature has been drawn and the " +
                            "browser checks have passed. " +
                            "Reference: MPS-DEMO-0001. " +
                            "Nothing has been sent, uploaded or saved. " +
                            "This is not an official admission submission.";


                        message.scrollIntoView({

                            behavior: "smooth",

                            block: "center"

                        });

                    }
                );

            }

        }

    }

})();
