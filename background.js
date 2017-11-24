(function() {
    'use strict';

    localStorage.clear();

    let choiceResult = [];
    let skipResult = [];
    let surveyList = [];
    let len = 0;

    $(function() {
        $("#survey-data, #final-output, #finish").hide();
        // $('#start').prop("disabled", true);

        // $('#name, #age, .gender').change(function() {

        //     if ($('#name').val() && $('#age').val() && $('input[name=gender]:checked').val() !== '') {
        //         $('#start').prop("disabled", false);
        //     } else {
        //         $('#start').prop("disabled", true);
        //     }
        // });


        // $('input').change(function() {
        //     var formElement = document.querySelector("form");
        //     let fd = new FormData(formElement);
        //     let name, age, gender;
        //     [name, age, gender] = [fd.get('name'), fd.get('age'), fd.get('gender')];
        //     // console.log("Check details", name, age, gender);
        //     // console.log("CHECK", name.trim().length());
        //     if(name === ""){
        //         console.log("details are incomplete");
        //         // console.log(age, gender);
        //         $('#start').prop("disabled", false);
        //     } else {
        //         $('#start').prop("disabled", true);
        //     }
        // });

        // if(name && age && gender){
        //     console.log("Values are null");
        //     $('#start').prop("disabled", false);
        // } else {
        //     console.log("Values are not null");
        //     $('#start').prop("disabled", true);
        // }

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
                    _demo.storeData();
                    _demo.display();
                    break;
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
            // console.log("storeDetails() is called");
            $("#welcome").hide();
            $("#survey-data").show();
            this.num = 0;
            var formElement = document.querySelector("form");
            let fd = new FormData(formElement);

            let basicDetail = { name: fd.get('name'), age: fd.get('age'), gender: fd.get('gender') };
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
                radio += `<label class="custom-control custom-radio col-sm-6">
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
                // console.log(this.num);
                skipResult.push({
                    [this.num]: 'N/A'
                });
                console.log("Pushed in array", skipResult);
            } else {
                console.log("Checked option is defined");
                choiceResult.push({
                    [this.num]: checkedOption
                });
            }
            // console.log("CHECK", skipResult);
            // console.log(choiceResult);

            localStorage.setItem("choices", JSON.stringify(choiceResult));
        },

        //function displays the final thank-you message and the recorded response
        finalMessage: function() {
            // console.log("finalMessage() is called");
            $("#survey-data").hide();
            $("#final-output").show();

            let details = JSON.parse(localStorage.getItem("userdetails"));
            console.log("details", details);

            $('#uname').html(details.name);
            $('#uage').html(details.age);
            $('#ugender').html(details.gender);

            //array of object [{1: ""}, {2: ""}, ..]
            let surveyResult = JSON.parse(localStorage.getItem("choices"));

            let output = '';

            // var finObj = Object.assign({}, ...skipResult, ...surveyResult);  //combines both the objects into one
            // console.log("CHECK THIS fin", finObj);

            // displays the ques no, quesiton and selected option
            surveyResult.map(function(obj) {
                let survey_question_number = Object.keys(obj);
                let survey_question = surveyList[survey_question_number - 1].question;
                let survey_answer = Object.values(obj);
                output += `<dl>
                                <dt>Question ${survey_question_number}.  ${survey_question}</dt>
                                <dd class="font-select"><b>Answer:</b> ${survey_answer}</dd>
                             </dl>`;
                //     console.log("Final output", output);
            });
            $('#ques-ans').append(output);
        }
    };

})();