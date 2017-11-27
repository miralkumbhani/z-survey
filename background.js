(function() {
    'use strict';

    localStorage.clear();

    let choiceResult = [];
    let surveyList = [];
    let len = 0;

    $(function() {
        $("#survey-data, #final-output, #finish").hide();
        $('#start').prop("disabled", true);

        $('input').change(function() {
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
            } else {
                console.log("Checked option is defined");

                choiceResult.push({
                    [this.num] : checkedOption
                });

                let finalRresult = Object.assign({}, ...choiceResult);
                console.log("finalRresult", finalRresult);
            }
            // console.log("CHECK ChoiceArray", choiceResult);
            // console.log("CHECK key", choiceResult[0].question); //question-number

            localStorage.setItem("choices", JSON.stringify(choiceResult));
        },

        //function displays the final thank-you message and the recorded response
        finalMessage: function() {
            // console.log("finalMessage() is called");
            $("#survey-data").hide();
            $("#final-output").show();

            let details = JSON.parse(localStorage.getItem("userdetails"));
            // console.log("details", details);

            $('#uname').html(details.name);
            $('#uage').html(details.age);
            $('#ugender').html(details.gender);

            //array of object [{1: ""}, {2: ""}, ..]
            let surveyResultList = JSON.parse(localStorage.getItem("choices"));

            // displays the ques no, question and selected option
            let attempted_question_list = surveyResultList.map(function(obj) {
                let attempted_ques = obj.question;
                return attempted_ques;
            });
            console.log("Attempted Question list array ", attempted_question_list);

            // let mappedArray = surveyList.filter(function(obj){
            //     // console.log(obj);
            //     for(let key in obj){
            //         console.log("CHECK THIS:", key);
            //     }
            // });

            // for(let values of Object.keys(surveyList)) {
            //     let ques = surveyList[values].question;
            //     console.log("QUESTION IS:", ques); //gives list of all questions
            // }

            // for(attempted_question_list of Object.keys(surveyList)) {
            //     // console.log("CHECKKKKKK", attempted_question_list);
            //     let val = surveyList[attempted_question_list].question;
            //     console.log("CHECCCCCCCKKKK", val); //gives list of all questions
            // }

            // for(let i = 0; i < surveyList.length; i++){
            //     console.log("surveyList Question", surveyList[i].question);
            //     console.log("Questionlist is", attempted_question_list[i]);
            // }

            // Object.keys(surveyList).forEach(function(val){
            //     console.log("VAL", val);
            //     // console.log("AQL", attempted_question_list[val]);
            //     if(attempted_question_list === val){
            //         console.log("BOTH ARE SAME", attempted_question_list, val);
            //     }
            // });

            // for(let val in surveyResultList){
            //     console.log("VAL", val);
            //     let ques = surveyList[val].question;
            //     console.log("CHECK QUESTION", ques);
            // }

            // for(let i = 0; i < attempted_question_list.length; i++){
            //     let ques_no = attempted_question_list[i];
            //     let ques = surveyList[ques_no - 1].question;
            //     console.log("ques", ques);
            // }

            // let remaining_questions = attempted_question_list.filter(function(x){
            //     console.log(x);
            // });


        }
    };

})();