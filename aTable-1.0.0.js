
/*
aTable version v1.0.0
Copyright 2012, Amartya Maiti
------------License---------------------------------------------------------------------------------------------------------------------------------
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, 
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
------------------------------------------------------------------------------------------------------------------------------------------------------
*/


(function ($) {
    $.fn.aTable = function (options) {

        return this.each(function () {
            if (options) {
                var tableId = $(this).attr('id');
                var masterWrapper = $('<div class="atable-master">');
                if (tableId != undefined)
                    masterWrapper.attr('id', tableId);

                var headerTable = CreateWapperPanel('atable-header', CreateHeaderTable(masterWrapper, options));
                headerTable.find('tr').append('<th style="width:10px">');

                masterWrapper.append(headerTable);

                var tbody = CreateTableBody(options, $(this));
                var bodyTable = CreateWapperPanel('atable-body', tbody);
                masterWrapper.append(bodyTable);

                masterWrapper.find('.atable-body').find('tr').each(function () {
                    BindDoubleClickEvent(bodyTable, $(this));
                });

                var footerTable = CreateWapperPanel('atable-footer', CreateFooterTable(options));
                masterWrapper.append(footerTable);
                $(this).replaceWith(masterWrapper);


                AllButtonEvent(tbody, options);
            }
            else
                alert('invalid options.');

        });


        //--------------------FUNCTION:CreateHeaderTable--------------------------------------//
        //DESCRIPTION:
        //
        function CreateHeaderTable(masterWrapper, options) {
            var tbody = $('<tbody>');
            var tr = $('<tr>');

            $.each(options.cell, function (i) {
                var th = $('<th>');
                var label = $('<label>');
                var className = this.ClassName;
                label.text(this.Header);
                if (this.InputType == 'checkbox') {
                    var checkbox = $('<input type="checkbox">');
                    checkbox.change(function () {
                        if ($(this).is(':checked'))
                            masterWrapper.find('.' + className).attr('checked', 'checked').prev('input').val('True');
                        else
                            masterWrapper.find('.' + className).removeAttr('checked').prev('input').val('False');
                    });
                    th.append(checkbox);
                }
                if (this.InputType == 'hidden')
                    th.css({ 'display': 'none', 'width': 0 });
                else
                    th.css('width', this.Width).append(label);
                tr.append(th);
            });

            tbody.append(tr);
            return tbody;
        }

        //--------------------FUNCTION:CreateTableBody--------------------------------------//
        //DESCRIPTION:
        //
        function CreateTableBody(options, table) {
            var modelName = options.model;
            table.find('tr').each(function (index) {
                var tableTr = $(this);
                var modelNameIndex = modelName + '[' + index + '].';
                $.each(options.cell, function (i) {
                    CreateTableTd(this, tableTr.find('td:eq(' + i + ')'), modelNameIndex, false);
                });
            });
            var tbody = table.find('tbody');
            return tbody;
        }

        //--------------------FUNCTION:CreateTableTd---------------------------------------//
        //DESCRIPTION:
        //
        function CreateTableTd(cell, tableTd, modelNameIndex, isNew) {
            var inputType = cell.InputType;
            var tdText = tableTd.text();

            var textLabel = $('<label>');
            if (!isNew)
                textLabel.append(tdText);

            if (cell.IsValidate)
                textLabel.addClass('isValidate');
            tableTd.css('width', cell.Width);
            switch (inputType) {
                case 'text':
                    tableTd.text('').append(textLabel);
                    var hiddenName = modelNameIndex + cell.HiddenValueName;
                    var hiddenInput = CreateHiddenInputs(hiddenName, $.trim(tableTd.text()), null);
                    hiddenInput.addClass('hdval').attr({ 'oldval': tdText });
                    tableTd.append(hiddenInput);
                    tableTd.attr({ 'adata': 'text', 'adata-hdvalclass': 'hdval', 'adata-class': cell.ClassName, 'adata-editable': cell.IsEdit, 'adata-click': 'dbclick' });
                    break;

                case 'select':
                    tableTd.text('').append(textLabel);
                    var hiddentextName = modelNameIndex + cell.HiddenTextName;
                    var hiddenText = CreateHiddenInputs(hiddentextName, $.trim(tableTd.text()), null);
                    hiddenText.addClass('hdtxt');
                    tableTd.append(hiddenText);

                    var hiddenvalueName = modelNameIndex + cell.HiddenValueName;
                    var selectId = cell.SelectId;
                    var selectedValue = GetSelectedValue(selectId, $.trim(tableTd.text()));

                    var hiddenVal = CreateHiddenInputs(hiddenvalueName, selectedValue, null);
                    hiddenVal.addClass('hdval').attr({ 'oldval': selectedValue });
                    tableTd.append(hiddenVal);

                    tableTd.attr({ 'adata': 'select', 'adata-selectid': selectId, 'adata-hdvalclass': 'hdval', 'adata-hdtxtclass': 'hdtxt', 'adata-editable': cell.IsEdit, 'adata-click': 'dbclick' });
                    break;

                case 'checkbox':
                    var hiddenName = modelNameIndex + cell.HiddenValueName;
                    var hiddenInput = CreateHiddenInputs(hiddenName, $.trim(tableTd.text()), null);
                    var checkbox = $('<input type="checkbox" class="' + cell.ClassName + '" >');
                    if (hiddenInput.val() == cell.Checked)
                        checkbox.attr('checked', 'checked');
                    checkbox.change(function () {
                        if ($(this).is(':checked'))
                            $(this).prev('input').val('True');
                        else
                            $(this).prev('input').val('False');
                    });
                    if (tdText == "" || tdText == undefined)
                        tdText = cell.Unchecked;
                    hiddenInput.addClass('hdval').attr({ 'oldval': tdText }).val(tdText);
                    tableTd.text('').append(hiddenInput).append(checkbox);
                    tableTd.attr({ 'adata': 'checkbox', 'adata-hdvalclass': 'hdval', 'adata-checked': cell.Checked, 'adata-unchecked': cell.Unchecked });
                    break;

                case 'radio':
                    var hiddenName = modelNameIndex + cell.HiddenValueName;
                    var hiddenInput = CreateHiddenInputs(hiddenName, $.trim(tableTd.text()), null);
                    var radio = $('<input type="radio" class="' + cell.ClassName + '" name="' + cell.ClassName + '">');
                    if (hiddenInput.val() == cell.Checked)
                        radio.attr('checked', 'checked');
                    radio.change(function () {
                        $('.' + cell.ClassName).each(function (i) {
                            if ($(this).is(':checked'))
                                $(this).prev('input').val('True');
                            else
                                $(this).prev('input').val('False');
                        });
                    });
                    if (tdText == "" || tdText == undefined)
                        tdText = cell.Unchecked;
                    hiddenInput.addClass('hdval').attr({ 'oldval': tdText }).val(tdText);
                    tableTd.text('').append(hiddenInput).append(radio);
                    tableTd.attr({ 'adata': 'radio', 'adata-hdvalclass': 'hdval', 'adata-checked': cell.Checked, 'adata-unchecked': cell.Unchecked });
                    break;

                case 'hidden':
                    tableTd.css({ 'width': 0, 'display': 'none' });
                    $.each(cell.HiddenList, function (i) {
                        var hiddenField = null;
                        var value = null;
                        var hiddenName = modelNameIndex + this.Name;
                        if (!isNew) {
                            hiddenField = tableTd.find('input').eq(i);
                            value = hiddenField.val();
                        }
                        else
                            value = $.trim(this.Value);
                        var hiddenInput = CreateHiddenInputs(hiddenName, value, hiddenField);
                        if (isNew)
                            tableTd.append(hiddenInput);
                    });
                    break;

                case 'none':
                    tableTd.text('').append(textLabel);
                    var hiddenName = modelNameIndex + cell.HiddenValueName;
                    var hiddenInput = CreateHiddenInputs(hiddenName, $.trim(tableTd.text()), null);
                    hiddenInput.addClass('hdval');
                    tableTd.append(hiddenInput);
                    if (cell.Index)
                        tableTd.attr({ 'adata': 'none', 'adata-index': 'true', 'adata-hdvalclass': 'hdval' });
                    break;
                default:
                    break;

            }
        }


        //--------------------FUNCTION:CreateHiddenInputs--------------------------------------//
        //DESCRIPTION:
        //
        function CreateHiddenInputs(hiddenName, value, hiddenfield) {
            var hiddenInput = null
            if (hiddenfield == null)
                hiddenInput = $('<input type="hidden" >');
            else
                hiddenInput = hiddenfield
            hiddenInput.attr({ 'name': hiddenName }).val(value);
            return hiddenInput;
        }

        //--------------------FUNCTION:GetSelectedValue----------------------------------------//
        //DESCRIPTION:
        //
        function GetSelectedValue(selectId, slectedText) {
            var selectedValue = null;
            $('#' + selectId).find('option').each(function () {
                if ($(this).text() == slectedText) {
                    selectedValue = $(this).val();
                }
            });
            return selectedValue;
        }

        //--------------------FUNCTION:CreateWapperPanel----------------------------------------//
        //DESCRIPTION:
        //
        function CreateWapperPanel(className, tbody) {
            var panel = $('<div class="' + className + '">');
            var table = $('<table cellpadding="0" cellspacing="0" >');
            panel.append(table.append(tbody));
            return panel;
        }

        //--------------------FUNCTION:BindDoubleClickEvent----------------------------------------//
        //DESCRIPTION:
        //
        function BindDoubleClickEvent(table, tableTr) {
            var masterWrapper = table.parents('.atable-master');
            tableTr.find('td').each(function () {
                if ($(this).attr('adata-click') == 'dbclick') {
                    $(this).dblclick(function () {
                        if (masterWrapper.find('.adata-edit').length <= 0) {
                            tableTr.find('td').each(function () {
                                if ($(this).attr('adata-editable') == "true")
                                    CreateEditMode($(this));
                            });
                            ButtonToggleView(masterWrapper);
                            tableTr.find('.adata-edit').first().focus();
                        }
                    });
                }
            });
        }

        //--------------------FUNCTION:CreateEditMode--------------------------------------------//
        //DESCRIPTION:
        //
        function CreateEditMode(tableTd) {

            if (tableTd.find('.adata-edit').length <= 0) {

                var tdLabel = tableTd.find('label');
                tdLabel.removeClass('isValidate');
                var tdText = tdLabel.text();
                tdLabel.css('display', 'none');
                var aData = tableTd.attr('adata');

                switch (aData) {
                    case 'text':
                        var className = tableTd.attr('adata-class');
                        var input = $('<input type="text" class="adata-edit">');
                        input.val(tdText);
                        tableTd.append(input);
                        if (className != undefined)
                            input.addClass(className).attr('id', className);
                        break;
                    case 'select':
                        var input = $('#' + tableTd.attr('adata-selectid')).clone().removeAttr('id').addClass('adata-edit');
                        input.find('option').each(function () {
                            if ($(this).text() == tdText)
                                $(this).attr('selected', 'selected');
                        });
                        tableTd.append(input);
                        break;
                    default:

                }
            }
        }

        //--------------------FUNCTION:AcceptChanges---------------------------------------------//
        //DESCRIPTION:
        //
        function AcceptChanges(tableTd) {
            var aData = tableTd.attr('adata');
            var tdLabel = tableTd.find('label');
            tdLabel.addClass('isValidate');
            var hdvalclassName = tableTd.attr('adata-hdvalclass');
            var hdtxtclassName = tableTd.attr('adata-hdtxtclass');
            var hiddenVal = tableTd.find('.' + hdvalclassName);
            var hiddenText = tableTd.find('.' + hdtxtclassName);
            switch (aData) {
                case 'text':
                    var value = tableTd.find('.adata-edit').val();
                    value = $.trim(value);
                    hiddenVal.val(value);
                    tdLabel.text(value);
                    break;
                case 'select':
                    var value = tableTd.find('.adata-edit').val();
                    var txtvalue = tableTd.find('.adata-edit option:selected').text();
                    hiddenVal.val(value);
                    hiddenText.val(txtvalue);
                    tdLabel.text(txtvalue);
                    break;
                case 'none':
                    if (tableTd.attr('adata-index') == 'true') {
                        var tbody = tableTd.parents('tbody');
                        var index = tbody.find('tr').length;                        
                        if (tdLabel.text() == "") {
                            hiddenVal.val(index);
                            tdLabel.text(index);
                        }
                    }
                    break;
                default:

            }
            tableTd.find('.adata-edit').remove();
            tdLabel.show();
        }

        //--------------------FUNCTION:CancelChanges--------------------------------------------------//
        //DESCRIPTION:
        //
        function CancelChanges(tableTd) {
            var tdLabel = tableTd.find('label');
            tdLabel.addClass('isValidate');
            tableTd.find('.adata-edit').remove();
            tdLabel.show();
            tableTd.parents('.newtr').remove();
        }


        //--------------------FUNCTION:CreateFooterTable---------------------------------------------//
        //DESCRIPTION:
        //
        function CreateFooterTable(options) {
            var tbody = $('<tbody>');
            var tr = $('<tr>');
            var td = $('<td>');

            td.append('<label id="lnkAcptChange" class="footer-link" style="display:none" >Accept</label>');
            td.append('<label id="lnkCanChange" class="footer-link" style="display:none" >Cancel</label>');
            if (options.isnewrowadd)
                td.append('<label id="lnkAddRow" class="footer-link" style="display:block" >Add</label>');
            td.append('<label class ="footer-text" >For edit value double click it.</label>');
            tbody.append(tr.append(td));
            return tbody;
        }

        //--------------------FUNCTION:AllButtonEvent-----------------------------------------------//
        //DESCRIPTION:
        //
        function AllButtonEvent(table, options) {
            var masterWrapper = table.parents('.atable-master');

            masterWrapper.find('#lnkAcptChange').click(function () {
                var tr = masterWrapper.find('.adata-edit').parents('tr');
                var table = tr.parents('table');
                var isvalid = false;

                tr.find('td').each(function (i) {

                    //If td is editable then validate it's data
                    if ($(this).attr('adata-editable') == "true") {
                        //Empty and duplicate value validation
                        if (ValidateData(options.cell[i], $(this), table))
                            isvalid = true;
                        else {
                            isvalid = false;
                            return false;
                        }
                    }
                });

                if (isvalid) {
                    tr.find('td').each(function (i) {
                        if ($(this).attr('adata-editable') == 'true' || $(this).attr('adata-index') == 'true')
                            AcceptChanges($(this));
                    });

                    if (tr.hasClass('newtr')) {
                        tr.find('input').each(function () {
                            if ($(this).attr('type') != 'checkbox') {
                                var name = $(this).attr('name');
                                name = name.replace('_', '');
                                $(this).attr('name', name);
                            }
                        });
                    }
                    tr.removeAttr('class');
                    ButtonToggleView(masterWrapper);
                }
            });

            masterWrapper.find('#lnkCanChange').click(function () {
                var tr = masterWrapper.find('.adata-edit').parents('tr');
                tr.removeClass('atable-selected-tr');
                tr.find('td').each(function () {
                    CancelChanges($(this));
                });
                ButtonToggleView(masterWrapper);
            });


            masterWrapper.find('#lnkAddRow').click(function () {
                AddNewRow(masterWrapper, options);
                ButtonToggleView(masterWrapper);
            });
        }

        //--------------------FUNCTION:ButtonToggleView-----------------------------------------------//
        //DESCRIPTION:
        //
        function ButtonToggleView(table) {
            table.find('#lnkAcptChange').toggle();
            table.find('#lnkCanChange').toggle();
            table.find('#lnkAddRow').toggle();
        }



        //--------------------FUNCTION:AddNewRow-----------------------------------------------//
        //DESCRIPTION:
        //
        function AddNewRow(table, options) {
            var tr = $('<tr class="newtr" >');
            var index = table.find('.atable-body').find('tr').length;
            $.each(options.cell, function (i) {
                var td = $('<td>');
                var modelNameIndex = options.model + '[_' + index + '].';
                CreateTableTd(this, td, modelNameIndex, true);
                CreateEditMode(td);
                tr.append(td);
            });

            table.find('.atable-body').find('tbody').append(tr);
            BindDoubleClickEvent(table.find('.atable-body'), tr);
            tr.find('.adata-edit').first().focus();
        }

        //--------------------FUNCTION:ValidateData-----------------------------------------------//
        //DESCRIPTION:
        //
        function ValidateData(cell, tableTd, table) {
            var isValid = false;
            var value = null;
            if (!cell.IsValidate)
                return true;
            else {
                var aData = tableTd.attr('adata');
                var isOnlyOneRow = table.find('[adata="' + aData + '"]').find('.isValidate').length;
                table.find('[adata="' + aData + '"]').find('.isValidate').each(function (i) {

                    switch (aData) {
                        case 'text': value = tableTd.find('.adata-edit').val();
                            break;
                        case 'select': value = tableTd.find('.adata-edit option:selected').text();
                            break;
                    }

                    if (CheckEmpty(value, tableTd))
                        return false;
                    else if (CheckDuplicate($(this).text(), value, tableTd, cell.ErrorMessage)) {
                        isValid = false;
                        return false;
                    }
                    else if (CheckLength(value, tableTd, cell.TxtLength)) {
                        isValid = false;
                        return false;
                    }
                    else
                        isValid = true;

                });
                if (isOnlyOneRow == 0) {
                    var value = tableTd.find('.adata-edit').val();
                    if (CheckEmpty(value, tableTd))
                        isValid = false;
                    else
                        isValid = true;
                }
            }

            return isValid;
        }

        //--------------------FUNCTION:CheckEmpty-----------------------------------------------//
        //DESCRIPTION:
        //
        function CheckEmpty(value, tableTd) {
            var aData = tableTd.attr('adata');
            var invalid = false;
            switch (aData) {
                case 'text': if ($.trim(value) == '')
                        invalid = true;
                    break;
                /*case 'radio':
                var checked = tableTd.attr('adata-checked');
                var unchecked = tableTd.attr('adata-unchecked');
                var className = tableTd.find('input[type="radio"]').attr('class');
                $('.' + className).each(function () {
                if ($(this).is(':checked'))
                invalid = false;
                else
                invalid = true;
                });
                break;*/ 
                default:

            }
            if (invalid) {
                var message = "This Field is required.";
                PopupWindow(message, tableTd.find('.adata-edit'));
                return true;
            }
            return false;
        }

        //--------------------FUNCTION:CheckDuplicate-----------------------------------------------//
        //DESCRIPTION:
        //
        function CheckDuplicate(valueOne, valueTwo, tableTd, errormessage) {
            if (valueOne == valueTwo) {
                var message = "Duplicate value found.";
                if (errormessage)
                    message = errormessage;
                PopupWindow(message, tableTd.find('.adata-edit'));
                return true;
            }
            return false;
        }

        //--------------------FUNCTION:CheckLength-----------------------------------------------//
        //DESCRIPTION:
        //
        function CheckLength(value, tableTd, txtLength) {
            var length = value.split("");
            var message = "The value entered is greater than the maximum length.";
            if (txtLength == undefined || txtLength == null)
                txtLength = 50;
            if (txtLength < length.length) {
                PopupWindow(message, tableTd.find('.adata-edit'));
                return true;
            }
            return false;
        }

        //--------------------FUNCTION:PopupWindow-----------------------------------------------//
        //DESCRIPTION:
        //
        function PopupWindow(message, input) {
            var popuppanel = $('<div class="popup-panel" >');
            popuppanel.text(message);
            popuppanel.show().dialog({
                modal: true,
                resizable: false,
                title: 'Error',
                buttons: {
                    Ok: function () {
                        $(this).dialog("close");
                        input.focus();
                    }
                }
            });
        }

    }
})(jQuery);