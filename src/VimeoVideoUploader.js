"use strict";

class VimeoVideoUploader {

    constructor(data = {}) {
        this.initial_data = data;
        this.upload_link = data.upload_link;
        this.progress = data.progress;
        this.success = data.success;
        this.file = data.file;
        this.continue = data.continue;
        this.timeout = data.timeout;
        this.loaded = 0;
        this.total = this.file.size - 1;
        // let step = 1024*1024*4;
        if (!this.timeout) {
            this.timeout = 15000;
        }
        this.step = Math.floor((0.01 * this.total));
        if (this.step < 1024) {
            this.step = 1024;
        } else if (this.step > (1024 * 1024)) {
            this.step = (1024 * 1024);
        }
        if (this.total < this.step) {
            this.step = this.total;
        }

        var loadEnd = this.step;
        FileReader.prototype.vimeoUploader = this;
        this.reader = new FileReader();
        this.reader.onload = function(event) {
            if (!event.target.result || event.target.result.length == 0) {
                console.log("finish because is trying to send nothing");
                this.finish();
                return;
            }
            XMLHttpRequest.prototype.vimeoUploader = this.vimeoUploader;
            XMLHttpRequestUpload.prototype.vimeoUploader = this.vimeoUploader;
            var upload_xhr = new XMLHttpRequest();
            upload_xhr.addEventListener("error", function() {
                console.log("error uploading on vimeo.");
                this.vimeoUploader.check_and_start();
            });
            upload_xhr.addEventListener("abort", function() {
                console.log("abort uploading on vimeo.");
                this.vimeoUploader.check_and_start();
            });
            var upload = upload_xhr.upload;
            upload.addEventListener('load', function() {
                this.vimeoUploader.check_and_start();
            }, false);
            upload_xhr.open("PUT", this.vimeoUploader.upload_link, true);
            upload_xhr.setRequestHeader("Content-Type", "application/octet-stream");
            upload_xhr.setRequestHeader("Content-Range", "bytes " + this.vimeoUploader.loaded + "-" + (this.vimeoUploader.loaded + event.target.result.length - 1) + "/" + this.vimeoUploader.file.size);
            upload_xhr.setRequestHeader("Accept", "application/vnd.vimeo.*+json;version=3.2");
            upload_xhr.send(event.target.result);
        };

        this.finish = function() {
            console.log("finish function");
            XMLHttpRequest.prototype.vimeoUploader = null;
            XMLHttpRequestUpload.prototype.vimeoUploader = null;
            FileReader.prototype.vimeoUploader = null;
            if (this.success) {
                this.success(this.initial_data, this.loaded);
            }
        }

        this.check_and_start = function() {
            if (this.continue && !this.continue()) {
                return;
            }
            XMLHttpRequest.prototype.vimeoUploader = this;
            var check_xhr = new XMLHttpRequest();
            check_xhr.addEventListener("error", function() {
                console.log("Error checking upload on vimeo. restarting in " + this.vimeoUploader.timeout + " milliseconds");
                Window.prototype.vimeoUploader = this.vimeoUploader;
                setTimeout(function() {
                    this.vimeoUploader.check_and_start();
                }, this.vimeoUploader.timeout);
            });
            check_xhr.addEventListener("abort", function() {
                console.log("Abort checking upload on vimeo. Restarting in " + this.vimeoUploader.timeout + " milliseconds");
                Window.prototype.vimeoUploader = this.vimeoUploader;
                setTimeout(function() {
                    this.vimeoUploader.check_and_start();
                }, this.vimeoUploader.timeout);
            });
            check_xhr.addEventListener("load", function() {
                if (this.status != 308) {
                    console.log("Error checking upload on vimeo. Restarting in " + this.vimeoUploader.timeout + " milliseconds");
                    Window.prototype.vimeoUploader = this.vimeoUploader;
                    setTimeout(function() {
                        this.vimeoUploader.restart_upload();
                    }, this.vimeoUploader.timeout);
                    return;
                }
                let range = this.getResponseHeader("Range").split("-")[1];
                let loaded = Number.parseInt(range);
                this.vimeoUploader.new_file_part(loaded);
            });
            check_xhr.open("PUT", this.upload_link, true);
            check_xhr.setRequestHeader("Content-Range", "bytes */*");
            check_xhr.setRequestHeader("Accept", "application/vnd.vimeo.*+json;version=3.2");
            check_xhr.send();
        }

        this.new_file_part = function(loaded) {
            try {
                this.loaded = loaded;
                if (this.progress) {
                    this.progress(this.initial_data, this.loaded, this.total);
                }
                if (this.continue && !this.continue()) {
                    return;
                }
                if (loaded >= this.total) {
                    console.log("after check");
                    this.finish();
                    return;
                }
                var loadEnd = this.loaded + this.step;
                if (loadEnd >= this.total) {
                    loadEnd = this.total;
                }
                var slice = this.file.slice(this.loaded, loadEnd);
                this.reader.readAsArrayBuffer(slice);
            } catch (error) {
                console.log(error);
                this.check_and_start();
            }
        }

    }

    start() {
        console.log(this.file);
        console.log(this.upload_link);
        this.check_and_start();
    }

};
