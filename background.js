(function() {
    'use strict';

    localStorage.clear();

    let choiceResult = [], surveyList = [], attemptedQuesNumber = [], unattemptedQuesNumber = [], totalQuesNumber = [];
    let user_name, user_age, user_gender;
    let len = 0;

    $(function() {
        $("#survey-data, #final-output, #finish").hide();
        $('#start').prop("disabled", true);

        $('input').change(() => {
            var formElement = document.querySelector("form");
            let fd = new FormData(formElement);

            [user_name, user_age, user_gender] = [fd.get('name'), fd.get('age'), fd.get('gender')];

            if (user_name && user_gender && user_gender) {
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
            switch (button_id) {
                case 'start':
                    _demo.storeBasicDetail();
                    _demo.fetchData().then((result) => {
                        surveyList = result;
                        len = surveyList.length;
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

            let basicDetail = { name: user_name, age: user_age, gender: user_gender };
            localStorage.setItem("userdetails", JSON.stringify(basicDetail));
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
            let question, options;

            [question, options] = [surveyList[this.num].question, surveyList[this.num].options];

            this.num = this.num + 1;

            // for last question
            if (this.num === len) {
                // alert("Hide buttons");
                $(".button-group").hide();
                $("#finish").show();
            }

            //array that contains all question numbers [1, 2, 3, ...]
            totalQuesNumber.push(this.num);

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
        //@param array of options eg. ['yes', 'no'];
        //@return string of options for each question for HTML
        getOptions: function(options) {
            let radio = '';
            //@param index = index of object and value = options[]
            $(options).each((index, value) => {
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

            if (typeof checkedOption === "undefined") {
                console.log("Checked option is undefined");
            } else {
                console.log("Checked option is defined");
                choiceResult.push({
                    [this.num]: checkedOption
                });
            }

            localStorage.setItem("choices", JSON.stringify(choiceResult));
        },

        //function displays the final thank-you message and the recorded response
        finalMessage: function() {
            // console.log("finalMessage() is called");
            $("#survey-data").hide();
            $("#final-output").show();

            let detailsOutput = '', skipResult = [], final = [], output = '';

            let details = JSON.parse(localStorage.getItem("userdetails"));

            //@param val = index of object and detail = {name: '', age: '', gender: ''}
            $(details).each((val, detail) => {
                detailsOutput += `<div class="col-sm-4 ">
                                    <label class="font-20 font-color"><b>NAME:</b></label><p class="py-2 font-18 font-select text-capitalize" id="uname">${detail.name}</p>
                                </div>
                                <div class="col-sm-4">
                                    <label class="font-20 font-color"><b>AGE:</b></label><p class="py-2 font-18 font-select" id="uage">${detail.age}</p>
                                </div>
                                <div class="col-sm-4"><label class="font-20 font-color"><b>GENDER:</b>
                                    </label><p class="py-2 font-18 font-select text-capitalize" id="ugender">${detail.gender}</p>
                                </div>`;
            });
            $('.details').append(detailsOutput);

            //array of object [{"1": ""}, {"2": ""}, ...]
            let surveyResultList = JSON.parse(localStorage.getItem("choices"));

            //creates attemptedQuesNumber[] for attempted questions
            //@returns attemptedQuesNumber = [1, 2, ...]
            surveyResultList.forEach((obj) => {
                attemptedQuesNumber.push(Object.keys(obj).map(Number)[0]);
            });

            //function to find the difference between two arrays i.e. from totalQuesNumber and attemptedQuesNumber
            //@param a = [1, 2, ...]
            Array.prototype.diff = function(a) {
                return this.filter(function(i) {
                    return a.indexOf(i) === -1;
                });
            };

            unattemptedQuesNumber = totalQuesNumber.diff(attemptedQuesNumber);

            //@returns array of object: [{2: "N/A"}, {5: "N/A"}, ...]
            unattemptedQuesNumber.forEach((index) => {
                skipResult.push({
                    [index]: "N/A"
                });
            });

            //@returns array of object: {1: "", 2: "N/A", ...}
            let finalResult = Object.assign({}, ...choiceResult, ...skipResult);

            for (let i = 0; i < len; i++) {
                final.push({
                    ques_num: Object.keys(finalResult)[i],
                    question: surveyList[i].question,
                    answer: Object.values(finalResult)[i]
                });
            }

            //@param obj = [{ques_num: 1, question: "", answer: ""}, {ques_num: 2, question: "", answer: ""}, ...]
            final.map((obj) => {
                output += `<dl>
                                <dt>Question ${obj.ques_num}.  ${obj.question}</dt>
                                <dd class="font-select"><b>Answer:</b> ${obj.answer}</dd>
                             </dl>`;
            });
            $('#result').append(output);
        }
    };

})();