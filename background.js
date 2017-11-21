(function() {
    'use strict';

    localStorage.clear();
    let choiceArray = [];
    $(function() {
        $("#survey-data, #final-output, #finish").hide();

        $('.proceed').on('click', function() {
            // console.log('click on next, skip');
            let button_id = this.id;
            console.log("button-id", button_id);
            switch (button_id) {
                 case 'start':
                    _demo.init();
                    break;
                case 'next':
                    _demo.storeData();
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

        $(document).on('click', ':radio', function() {
            let checked = $(this).prop("checked");
            // console.log("CHECK RADIO", checked);
            if (checked) {
                $('#skip').prop("disabled", true);
                $('#next').prop("disabled", false);
            }
        });

    });

    const _demo = {
        //function displays the main class and loads data for use
        init: function() {
            console.log("init function is called");
            // console.log("init function is called");
            $("#welcome").hide();
            $("#survey-data").show();
            this.num = 0;
            this.fetchData().then((result) => {
                console.log("result", result);
                this.surveyList = result;
                console.log("check survey list", this.surveyList);
                this.len = this.surveyList.length;
                this.display();
            }).catch((err) => {
                console.error("Rejected", err);
            });
        },

        //function that fetches data from JSON
        //@returns object {question, [options]}
        fetchData: function() {
            console.log("fetch data function is called");
            console.log("inside fetchData()", this.num);
            return new Promise((resolve, reject) => {
                $.getJSON("./survey.json").done((data) => {
                    resolve(data);
                }).fail(() => {
                    reject(false);
                });
            });
        },

        //function for storing the data in local storage
        storeData: function() {
            console.log("store data is called");
            //for basic details
            let userName = $("#name").val();
            let userAge = $("#age").val();
            let userGender = $("#gender").val();

            localStorage.setItem("userdetails", JSON.stringify({ name: userName, age: userAge, gender: userGender }));

            //for question-options
            let checkedOption = $(":radio:checked").val();
            // console.log("checkedOption", checkedOption);
            if (typeof checkedOption === "undefined") {
                console.log("its undefined");
            } else {
                console.log("its defined");
                // console.log(this.num);
                choiceArray.push({
                    [this.num]: checkedOption
                });
                // console.log(choiceArray);

                localStorage.setItem("choices", JSON.stringify(choiceArray));
                console.log(choiceArray);
            }
        },

        //function sets the radio buttons of options for questions
        // @param array of options eg. ['yes, 'no];
        //@return string of options for each question for HTML
        getOptions: function(options) {
            let radio = '';
            $(options).each(function(index, value) {
                radio += `<label class="custom-control custom-radio col-md-2">
                <input id="radio_${index}" name="radio" type="radio" value="${value}" class="custom-control-input cursor-radio">
                <span class="custom-control-indicator"></span>
                <span class="custom-control-description option-text">${value}</span>
                </label>`;
            });
            return radio;
        },

        //function sets the value for progress bar dynamically
        //@returns number along with % for HTML to update the progress bar according to the question
        setProgressBar: function(num) {
            let cal = (num + 1) * (100 / this.len);
            $("#progress-bar").css("width", function() {
                return cal + '%';
            });
        },

        //function uses surveyList and displays the questions and options
        display: function() {
            console.log("in display function");
            console.log("this.surveyList in display()", this.surveyList);
            $('#next').prop("disabled", true);
            $('#skip').prop("disabled", false);

            console.log("Check in display()", this.num);
            this.setProgressBar(this.num);
            let question = this.surveyList[this.num].question;
            let options = this.surveyList[this.num].options;

            this.num = this.num + 1;

            // for last question
            if (this.num === this.len) {
                $(".button-group").hide();
                $("#finish").show();
            }

            $("#ques-no").html(this.num);
            $("#question").html(question);
            $("#options").html(this.getOptions(options));
        },

        //function displays the final thank-you message and the recorded response
        finalMessage: function() {
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