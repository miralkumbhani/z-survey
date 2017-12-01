(function() {
    'use strict';

    localStorage.clear();

    let choiceResult = [];
    let surveyList = [];
    let attemptedQuesNumber = [];
    let unattemptedQuesNumber = [];
    let totalQuesNumber = [];
    let len = 0;

    $(function() {
        $("#survey-data, #final-output, #finish").hide();
        $('#start').prop("disabled", true);

        $('input').change(() => {
            var formElement = document.querySelector("form");
            let fd = new FormData(formElement);
            let name, age, gender;
            [name, age, gender] = [fd.get('name'), fd.get('age'), fd.get('gender')];
            if (name && age && gender) {
                $('#start').prop("disabled", false);
            } else {
                $('#start').prop("disabled", true);
            }
        });

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
                        // console.log("surveyList",surveyList);
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
                    _demo.display();
            }
        });

        $(document).on('click', 'input[name=options]', function() {
            let checked = $(this).prop("checked");
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
            });
        },

        //function to get question and answer after each click of Next/Skip Button
        display: function() {
            // console.log("display() is called");
            this.setProgressBar(this.num);
            let question = surveyList[this.num].question;
            let options = surveyList[this.num].options;

            this.num = this.num + 1;

            // for last question
            if (this.num === len) {
                // alert("Hide buttons");
                $(".button-group").hide();
                $("#finish").show();
            }

            //array that contains all question numbers [1, 2, 3, ...]
            totalQuesNumber.push(this.num);
            // console.log("question_num", totalQuesNumber);

            $("#ques-no").html(this.num);
            $("#question").html(question);
            $("#options").html(this.getOptions(options));
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
        //@param array of options eg. ['yes, 'no];
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

        //function stores the data selected by user and stores into local storage
        storeData: function() {
            // console.log("storeData() is called");
            //for question-options
            let checkedOption = $("input[name=options]:checked").val();
            // console.log("checkedOption", checkedOption);

            if (typeof checkedOption === "undefined") {
                console.log("Checked option is undefined");
            } else {
                console.log("Checked option is defined");
                choiceResult.push({
                    [this.num]: checkedOption
                });

                //array that stores attempted question numbers
                // attemptedQuesNumber.push(this.num);

                // let resultObj = Object.assign({}, ...choiceResult);
                // console.log("finalResult", resultObj);
            }

            localStorage.setItem("choices", JSON.stringify(choiceResult));
        },

        //function displays the final thank-you message and the recorded response
        finalMessage: function() {
            // console.log("finalMessage() is called");
            $("#survey-data").hide();
            $("#final-output").show();

            let details = JSON.parse(localStorage.getItem("userdetails"));

            $('#uname').html(details.name);
            $('#uage').html(details.age);
            $('#ugender').html(details.gender);

            //array of object [{1: ""}, {2: ""}, ..]
            let surveyResultList = JSON.parse(localStorage.getItem("choices"));
            console.log("surveyResultList", surveyResultList);

            //creates attemptedQuesNumber[] for attempted questions
            surveyResultList.forEach(function(obj) {
                attemptedQuesNumber.push(Object.keys(obj).map(Number)[0]);
            });
            // console.log(attemptedQuesNumber);

            Array.prototype.diff = function(a) {
                return this.filter(function(i) {
                    return a.indexOf(i) === -1;
                });
            };

            unattemptedQuesNumber = totalQuesNumber.diff(attemptedQuesNumber);

            //@returns array of object: [{2: N/A}, {5: N/A}, ...]
            let skipResult = [];
            unattemptedQuesNumber.forEach(function(index) {
                skipResult.push({
                    [index]: "N/A"
                });
            });
            // console.log("skip", skipResult);

            let finalResult = Object.assign({}, ...choiceResult, ...skipResult);
            // console.log("finalResult", finalResult);

            let final = [];
            for(let i = 0; i < len; i++){
                final.push({
                    ques_num: Object.keys(finalResult)[i],
                    question: surveyList[i].question,
                    answer: Object.values(finalResult)[i]
                });
            }
            // console.log("final", final);
            let output = '';
            final.map(function(obj) {
                output += `<dl>
                                <dt>Question ${obj.ques_num}.  ${obj.question}</dt>
                                <dd class="font-select"><b>Answer:</b> ${obj.answer}</dd>
                             </dl>`;
                //     console.log("Final output", output);
            });
            $('#result').append(output);
        }
    };

})();