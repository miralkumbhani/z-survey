(function() {
    'use strict';

    const _demographRecord = function() {
        $('.main').hide();
    };

    _demographRecord.prototype = {
        init: async function() {
            this.num = 0;
            this.len = 0;
            $(".form").hide();
            $(".main").show();

            this.dataList = await this.fetchData();
            this.display();
        },

        fetchData: function() {
            return new Promise((resolve, reject) => {
                $.getJSON("./survey.json").done((data) => {
                    resolve(data);
                }).fail(() => {
                    reject(false);
                });
            });
        },

        display: function() {
            //put or check a counter to check whether the question is skipped or answered
            let len = this.dataList.length;
            this.len = len;
            let num = this.num;
            num = (num >= len) ? 0 : this.num;
            let question = this.dataList[num].question;
            let options = this.dataList[num].options;
            this.num = (this.num >= len) ? 0 : this.num + 1;
            if (this.num === 0) { //because of the start button
                this.num = 1;
            }

            $('#quesnum').html(this.num + ".");
            $('#question').html(question);
            $('#options').html(this.getOptions(options));

            this.setProgressBar(num);
        },

        getOptions: function(options) {
            let radio = '';
            $(options).each(function(index, value) {
                radio += `<label class="custom-control custom-radio">
                <input id="radio_${index}" name="radio" type="radio" value="${value}" class="custom-control-input">
                <span class="custom-control-indicator"></span>
                <span class="custom-control-description option-text">${value}</span>
                </label>`;
            });
            return radio;
        },

        setProgressBar: function(num) {
            // console.log("num", num);
            // console.log("this.len", this.len);
            let cal = (num + 1)* (100 / this.len);

            $('#progress-bar').css("width", function() {
                // console.log("cal", cal);
                return cal + '%';
            });
        }
    };

    window._demo = new _demographRecord();
})();