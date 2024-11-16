sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/m/BusyDialog",
    "sap/ui/model/odata/v2/ODataModel"
], function (Controller, MessageBox, MessageToast, BusyDialog, ODataModel) {
    "use strict";

    return Controller.extend("lbbooklog.controller.view2", {
        onInit: function () {
            var oModel = new ODataModel("/sap/opu/odata/sap/ZLIBRARY_SRV/");
            this.getView().setModel(oModel);
        },

        formatDateTimeToISO: function (date) {
            if (!date) return '';
            return date.toISOString(); // Convert Date to ISO 8601 string
        },

        formatTimeToSAP: function (timeString) {
            if (!timeString) return '';

            // Extract the time part and AM/PM indicator
            var timeParts = timeString.match(/(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)/i);
            if (!timeParts) return ''; // Invalid format

            var hours = parseInt(timeParts[1], 10);
            var minutes = parseInt(timeParts[2], 10);
            var seconds = parseInt(timeParts[3], 10);
            var period = timeParts[4].toUpperCase();

            // Convert hours from 12-hour format to 24-hour format
            if (period === 'PM' && hours < 12) {
                hours += 12;
            } else if (period === 'AM' && hours === 12) {
                hours = 0;
            }

            // Validate time parts
            if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || hours < 0 || hours >= 24 || minutes < 0 || minutes >= 60 || seconds < 0 || seconds >= 60) {
                return '';
            }

            // Calculate duration from midnight
            var totalSeconds = hours * 3600 + minutes * 60 + seconds;

            // Format duration as ISO 8601 duration
            var isoDuration = 'PT';
            var isoHours = Math.floor(totalSeconds / 3600);
            var isoMinutes = Math.floor((totalSeconds % 3600) / 60);
            var isoSeconds = totalSeconds % 60;

            if (isoHours > 0) {
                isoDuration += isoHours + 'H';
            }
            if (isoMinutes > 0) {
                isoDuration += isoMinutes + 'M';
            }
            if (isoSeconds > 0) {
                isoDuration += isoSeconds + 'S';
            }

            return isoDuration || 'PT0S'; // Ensure at least 'PT0S' is returned
        },

        onUpdate: function (oEvent) {
            var oView = this.getView();
            var oItem = oEvent.getSource().getParent().getParent();
            var oContext = oItem.getBindingContext();

            // Bind the dialog context
            var oDialog = this.byId("updateDialog");
            oDialog.setBindingContext(oContext);
            oDialog.open();
        },

        onSaveUpdate: function () {
            debugger
            var oView = this.getView();
            var oDialog = this.byId("updateDialog");
            var oContext = oDialog.getBindingContext();
            var oModel = this.getView().getModel();
        
            // Retrieve the updated data from the dialog inputs
            var sId = parseInt(this.byId("inputId").getValue().trim(), 10);
            var sBookIssueId = parseInt(this.byId("inputBookIssueId").getValue().trim(), 10);
            var sStudentId = parseInt(this.byId("inputStudentId").getValue().trim(), 10);
            var sIssueBy = parseInt(this.byId("inputIssueBy").getValue().trim(), 10);
        
           // var oIssuedAtControl = this.byId("inputIssuedAt");
           // var oReturnTimeControl = this.byId("inputReturnTime");
            
           // var sIssuedAt = oIssuedAtControl.getDateValue ? this.formatDateTimeToISO(oIssuedAtControl.getDateValue()) : '';
           // var sReturnTime = oReturnTimeControl.getDateValue ? this.formatDateTimeToISO(oReturnTimeControl.getDateValue()) : '';
            
           // var sTimeStamp = this.formatTimeToSAP(this.byId("inputTimeStamp").getValue());
        
            // Ensure all required fields are provided
          //  if (!sId || !sBookIssueId || !sStudentId || !sIssueBy || !sIssuedAt || !sReturnTime || !sTimeStamp) {
            //    MessageBox.error("Please fill in all required fields.");
              //  return;
           // }
        
            // Construct the updated data object
            var oUpdatedData = {
                Id: sId,
                BookIssueId: sBookIssueId,
                StudentId: sStudentId,
                IssueBy: sIssueBy,
               // IssuedAt: sIssuedAt,
               // ReturnTime: sReturnTime,
             //   TimeStamp: sTimeStamp
            };
        
            // Create a busy dialog
            var oBusyDialog = new BusyDialog({
                title: "Updating Record",
                text: "Please Wait..."
            });
        
            oBusyDialog.open();
        
            // Perform the update operation
            oModel.update(oContext.getPath(), oUpdatedData, {
                success: function () {
                    oBusyDialog.close();
                    MessageToast.show("Record updated successfully.");
                    oDialog.close();
                },
                error: function (oError) {
                    oBusyDialog.close();
                    var sErrorMsg = oError.message || "Error updating record.";
                    MessageBox.error(sErrorMsg);
                }
            });
        },        

        onCancelUpdate: function () {
            this.byId("updateDialog").close();
        },
        handleSave: function () {
            debugger
            // Navigate to the Report view
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("View"); // 'reportView' is the route name defined in your manifest.json
        },

        onDelete: function (oEvent) {
            var oView = this.getView();
            var oItem = oEvent.getSource().getParent().getParent();
            var oContext = oItem.getBindingContext();
            var oModel = this.getView().getModel();
            var oBusyDialog = new BusyDialog({
                title: "Deleting Record",
                text: "Please Wait..."
            });

            var oDialog = new MessageBox.confirm("Are you sure you want to delete this record?", {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (sAction) {
                    if (sAction === MessageBox.Action.YES) {
                        oBusyDialog.open();
                        oModel.remove(oContext.getPath(), {
                            success: function () {
                                oBusyDialog.close();
                                MessageToast.show("Record deleted successfully.");
                            },
                            error: function () {
                                oBusyDialog.close();
                                MessageBox.error("Error deleting record.");
                            }
                        });
                    }
                }
            });
        }
    });
});
