(function() {
    'use strict';

    localStorage.clear();
    let choicesArray = [];
    $(function() {
        $("#survey-block, #complete, #finish").hide();
        $('#start').on('click', function() {
            _demo.storeData();
            // console.log('click on start');
            _demo.init();
        });

        $('.proceed').on('click', function() {
            // console.log('click on next, skip');
            _demo.storeData();
            _demo.display();
        });

        $('#finish').on('click', function() {
            // console.log('click on finish');
            _demo.storeData();
            _demo.finalMessage();
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
            $("#welcome").hide();
            $("#survey-block").show();
            this.num = 0;
            this.fetchData().then((result) => {
                this.dataList = result;
                this.len = this.dataList.length;
                this.display();
            }).catch((err) => {
                console.error("Rejected", err);
            });
        },


        //function that fetches data from JSON
        //@returns object {question, [options]}
        fetchData: function() {
            return new Promise((resolve, reject) => {
                $.getJSON("./survey.json").done((data) => {
                    resolve(data);
                }).fail(() => {
                    reject(false);
                });
            });
        },

        //function uses dataList and displays the questions and options
        display: function() {
            $('#next').prop("disabled", true);
            $('#skip').prop("disabled", false);

            this.setProgressBar(this.num);
            let question = this.dataList[this.num].question;
            let options = this.dataList[this.num].options;

            this.num = this.num + 1;

            // for last question
            if (this.num === this.len) {
                $(".button-group").hide();
                $("#finish").show();
            }

            $("#quesno").html(this.num);
            $("#question").html(question);
            $("#options").html(this.getOptions(options));
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

        //function displays the final thank-you message
        finalMessage: function() {
            $("#survey-block").hide();
            $("#complete").show();
        },

        storeData: function() {
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
                // console.log("CHECK", finalArray);
                // let demo = [this.num + i];
                // console.log("CHECKKKK", demo);
                // console.log("this.num", this.num);
                // let val = this.num;
                // console.log("THIS.NUM", val);
                choicesArray.push({
                    [this.num]: checkedOption
                });

                console.log(choicesArray);
                localStorage.setItem("choices", JSON.stringify(choicesArray));

                let details = JSON.parse(localStorage.getItem("userdetails"));
                console.log(details.name);
                $("#uname").html(details.name);

                let selectedObj = JSON.parse(localStorage.getItem("choices"));
                console.log(selectedObj);
                selectedObj.map((i, id) => {
                    console.log(Object.keys(i)); //will give question no 1,2,3...
                    console.log("CHECK", Object.values(i, id)); //gives keys and values
                    console.log(Object.values(i));
                });

                // console.log("CHECKKK",[this.num]);

                // console.log(this.num);
                // console.log("CHECK", selectedObj[this.num]);
                // console.log("CHECK THISSs", selectedObj[].checkedOption);
                // $("#choices").html(selectedObj.checkedOption);
                // $("#choices").html(selectedArray[j]);

            }
        }

    };

})();