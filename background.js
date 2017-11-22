(function() {
    'use strict';

    localStorage.clear();

    let choiceArray = [];
    let surveyList = [];
    let len = 0;

    $(function() {

        $("#survey-data, #final-output, #finish").hide();

        $('.proceed').on('click', function() {
            //when no option is selected
            $('#skip').prop("disabled", false);
            $('#next').prop("disabled", true);

            let button_id = this.id;
            // console.log("button-id", button_id);
            switch (button_id) {
                case 'start':
                    _demo.storeBasicDetail();
                    _demo.fetchData().then((result) => {
                        // console.log("Output of fetchData() (JSON)", result);
                        surveyList = result;
                        // console.log("surveyList after fetchData(), before display()", surveyList);
                        len = surveyList.length;
                        // console.log("len", len);
                        _demo.display();
                    });
                    break;
                case 'next':
                    _demo.storeData();
                    _demo.display();
                    break;
                case 'finish':
                    _demo.storeData();
                    _demo.finalMessage();
                    break;
                case 'skip':
                default:
                    // console.log("start button is clicked!");
                    _demo.display();
            }
        });

        $(document).on('click', 'input[name=options]', function() {
            let checked = $(this).prop("checked");
            // console.log("this", this);
            // console.log("CHECK RADIO", checked);
            //when any option is selected
            if (checked) {
                $('#skip').prop("disabled", true);
                $('#next').prop("disabled", false);
            }
        });

    });

    const _demo = {
        //function stores details entered by user in local storage
        storeBasicDetail: function() {
            console.log("storeDetails() is called");
            $("#welcome").hide();
            $("#survey-data").show();
            this.num = 0;
            var formElement = document.querySelector("form");
            let fd = new FormData(formElement);

            let basicDetail = {name: fd.get('name'), age: fd.get('age'), gender: fd.get('gender')};
            // console.log(basicDetail);

            localStorage.setItem("userdetails", JSON.stringify(basicDetail));
            // console.log("data stored... endof storeData()");
        },

        //function that fetches data from JSON
        //@returns object {question, [options]}
        fetchData: function() {
            // console.log("fetchData() is called");
            return new Promise((resolve, reject) => {
                $.getJSON("./survey.json").done((data) => {
                    resolve(data);
                }).fail(() => {
                    reject(false);
                });
            // console.log("JSON data sent... endof fetchdata()");
            });
        },

        //function to get question and answer after each click of Next/Skip Button
        display: function() {
            // console.log("display() is called");

            this.setProgressBar(this.num);
            let question = surveyList[this.num].question;
            // console.log("question", question);
            let options = surveyList[this.num].options;
            // console.log("options", options);

            this.num = this.num + 1;

            // for last question
            if (this.num === len) {
                // alert("Hide buttons");
                $(".button-group").hide();
                $("#finish").show();
            }

            $("#ques-no").html(this.num);
            $("#question").html(question);
            $("#options").html(this.getOptions(options));

            // console.log("ques-options displayed... endof display()");
        },

        //function sets the value for progress bar dynamically
        //@returns number along with % for HTML to update the progress bar according to the question
        setProgressBar: function(num) {
            let cal = (num + 1) * (100 / len);
            $("#progress-bar").css("width", function() {
                return cal + '%';
            });
        },

        //function sets the radio buttons of options for questions
        // @param array of options eg. ['yes, 'no];
        //@return string of options for each question for HTML
        getOptions: function(options) {
            let radio = '';
            $(options).each(function(index, value) {
                radio += `<label class="custom-control custom-radio col-md-2">
                <input id="radio_${index}" name="options" type="radio" value="${value}" class="custom-control-input cursor-radio">
                <span class="custom-control-indicator"></span>
                <span class="custom-control-description option-text">${value}</span>
                </label>`;
            });
            return radio;
        },

        storeData: function() {
            // console.log("storeData() is called");
            //for question-options
            let checkedOption = $("input[name=options]:checked").val();
            // console.log("checkedOption", checkedOption);

            if (typeof checkedOption === "undefined") {
                console.log("Checked option is undefined");
            } else {
                console.log("Checked option is defined");
                choiceArray.push({
                    [this.num]: checkedOption
                });
            }
            // console.log(choiceArray);

            localStorage.setItem("choices", JSON.stringify(choiceArray));
        },

        //function displays the final thank-you message and the recorded response
        finalMessage: function() {
            console.log("finalMessage() is called");
            $("#survey-data").hide();
            $("#final-output").show();

            let details = JSON.parse(localStorage.getItem("userdetails"));
            // console.log(details.name);
            $("#uname").html(details.name);

            let selectedObj = JSON.parse(localStorage.getItem("choices"));

            for (let i = 0; i < selectedObj.length; i++) {
                $("#ques").append(Object.keys(selectedObj[i]) + '&nbsp;&nbsp;' + Object.values(selectedObj[i]) + '<br>');
                console.log("CHECK THIS", Object.values(selectedObj[i]));
            }
        }
    };

})();