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
                var masterWrapper = $('<div class="atable-master">');

                var headerTable = CreateWapperPanel('atable-header', CreateHeaderTable(masterWrapper, options));
                masterWrapper.append(headerTable);

                var tbody = CreateTableBody(options, $(this));
                var bodyTable = CreateWapperPanel('atable-body', tbody);
                masterWrapper.append(bodyTable);

                masterWrapper.find('.atable-body').find('tr').each(function () {
                    BindDoubleClickEvent(bodyTable, $(this));
                });

                var footerTable = CreateWapperPanel('atable-footer', CreateFooterTable());
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
                var className = this.className;
                label.text(this.header);
                if (this.inputType == 'checkbox') {
                    var checkbox = $('<input type="checkbox">');
                    checkbox.change(function () {
                        if ($(this).is(':checked'))
                            masterWrapper.find('.' + className).attr('checked', 'checked').prev('input').val('True');
                        else
                            masterWrapper.find('.' + className).removeAttr('checked').prev('input').val('False');
                    });
                    th.append(checkbox);
                }
                th.css('width', this.width).append(label);
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

                // BindDoubleClickEvent(table,$(this));
            });
            var tbody = table.find('tbody');
            return tbody;
        }

        //--------------------FUNCTION:CreateTableTd---------------------------------------//
        //DESCRIPTION:
        //
        function CreateTableTd(cell, tableTd, modelNameIndex, isNew) {
            var inputType = cell.inputType;
            var tdText = tableTd.text();
            var textLabel = $('<label>');
            if (!isNew)
                textLabel.append(tdText);

            if (cell.isDuplicate)
                textLabel.addClass('isDuplicate');
            tableTd.text('').css('width', cell.width);
            switch (inputType) {
                case 'text':
                    tableTd.append(textLabel);
                    var hiddenName = modelNameIndex + cell.hiddenName;
                    var hiddenInput = CreateHiddenInputs(hiddenName, $.trim(tableTd.text()));
                    hiddenInput.addClass('hdval').attr({ 'oldval': tdText });
                    tableTd.append(hiddenInput);
                    tableTd.attr({ 'adata': 'text', 'adata-hdvalclass': 'hdval' });
                    break;
                case 'select':
                    tableTd.append(textLabel);
                    var hiddentextName = modelNameIndex + cell.hiddentextName;
                    var hiddenText = CreateHiddenInputs(hiddentextName, tableTd.text());
                    hiddenText.addClass('hdtxt');
                    tableTd.append(hiddenText);

                    var hiddenvalueName = modelNameIndex + cell.hiddenvalueName;
                    var selectId = cell.selectId;
                    var selectedValue = GetSelectedValue(selectId, $.trim(tableTd.text()));

                    var hiddenVal = CreateHiddenInputs(hiddenvalueName, selectedValue);
                    hiddenVal.addClass('hdval').attr({ 'oldval': selectedValue });
                    tableTd.append(hiddenVal);

                    tableTd.attr({ 'adata': 'select', 'adata-selectid': selectId, 'adata-hdvalclass': 'hdval', 'adata-hdtxtclass': 'hdtxt' });
                    break;
                case 'checkbox':
                    var hiddenName = modelNameIndex + cell.hiddenName;
                    var hiddenInput = CreateHiddenInputs(hiddenName, $.trim(tableTd.text()));
                    var checkbox = $('<input type="checkbox" class="' + cell.className + '" >');
                    checkbox.change(function () {
                        if ($(this).is(':checked'))
                            $(this).prev('input').val('True');
                        else
                            $(this).prev('input').val('False');
                    });
                    hiddenInput.addClass('hdval').attr({ 'oldval': tdText }).val('False');
                    tableTd.append(hiddenInput).append(checkbox);
                    tableTd.attr({ 'adata': 'checkbox', 'adata-hdvalclass': 'hdval' });
                    break;

                default:
                    break;

            }
        }

        
        //--------------------FUNCTION:CreateHiddenInputs--------------------------------------//
        //DESCRIPTION:
        //
        function CreateHiddenInputs(hiddenName, value) {
            var hiddenInput = $('<input type="hidden" >');
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
            tableTr.dblclick(function () {
                if (masterWrapper.find('.adata-edit').length <= 0) {
                    $(this).find('td').each(function () {
                        CreateEditMode($(this));
                    });
                    ButtonToggleView(masterWrapper);
                }
            });
        }

        //--------------------FUNCTION:CreateEditMode--------------------------------------------//
        //DESCRIPTION:
        //
        function CreateEditMode(tableTd) {

            if (tableTd.find('.adata-edit').length <= 0) {

                var tdLabel = tableTd.find('label');
                tdLabel.removeClass('isDuplicate');
                var tdText = tdLabel.text();
                tdLabel.css('display', 'none');
                var aData = tableTd.attr('adata');

                switch (aData) {
                    case 'text':
                        var input = $('<input type="text" class="adata-edit">');
                        input.val(tdText);
                        tableTd.append(input);
                        input.focus();
                        break;
                    case 'select':
                        var input = $('#' + tableTd.attr('adata-selectid')).clone().removeAttr('id').addClass('adata-edit');
                        input.find('option').each(function () {
                            if ($(this).text() == tdText)
                                $(this).attr('selected', 'selected');
                        });
                        tableTd.append(input);
                        input.focus();
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
            tdLabel.addClass('isDuplicate');
            var hdvalclassName = tableTd.attr('adata-hdvalclass');
            var hdtxtclassName = tableTd.attr('adata-hdtxtclass');
            var hiddenVal = tableTd.find('.' + hdvalclassName);
            var hiddenText = tableTd.find('.' + hdtxtclassName);
            switch (aData) {
                case 'text':
                    var value = tableTd.find('.adata-edit').val();
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
            tableTd.find('.adata-edit').remove();
            tdLabel.show();
            tableTd.parents('.newtr').remove();
        }


        //--------------------FUNCTION:CreateFooterTable---------------------------------------------//
        //DESCRIPTION:
        //
        function CreateFooterTable() {
            var tbody = $('<tbody>');
            var tr = $('<tr>');
            var td = $('<td>');
            td.append('<label id="lnkAcptChange" style="display:none" >Accept</label>');
            td.append('<label id="lnkCanChange" style="display:none" >Cancel</label>');
            td.append('<label id="lnkAddRow" style="display:block" >Add</label>');
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
                    if (ValidateData(options.cell[i], $(this), table))
                        isvalid = true;
                    else {
                        isvalid = false;
                        return false;
                    }
                });

                if (isvalid) {
                    tr.find('td').each(function (i) {
                        AcceptChanges($(this));
                    });

                    if (tr.hasClass('newtr')) {
                        tr.find('input').each(function () {
                            var name = $(this).attr('name');                            
                            name = name.replace('_', '');
                            $(this).attr('name', name);
                        });
                    }
                    tr.removeAttr('class');
                    ButtonToggleView(masterWrapper);
                }
            });

            masterWrapper.find('#lnkCanChange').click(function () {
                var tr = masterWrapper.find('.adata-edit').parents('tr');
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
                CreateEditMode(td)
                tr.append(td);
            });

            table.find('.atable-body').find('tbody').append(tr);
            BindDoubleClickEvent(table, tr);
        }

        //--------------------FUNCTION:ValidateData-----------------------------------------------//
        //DESCRIPTION:
        //
        function ValidateData(cell, tableTd, table) {
            var isValid = false;
            var value = null;
            if (!cell.isDuplicate)
                return true;
            else {
                var aData = tableTd.attr('adata');
                var isOnlyOneRow = table.find('[adata="' + aData + '"]').find('.isDuplicate').length;
                table.find('[adata="' + aData + '"]').find('.isDuplicate').each(function (i) {

                    switch (aData) {
                        case 'text': value = tableTd.find('.adata-edit').val();
                            break;
                        case 'select': value = tableTd.find('.adata-edit option:selected').text();
                            break;
                    }

                    if (CheckEmpty(value, tableTd))
                        return false;
                    else if (CheckDuplicate($(this).text(), value, tableTd, cell.errormessage)) {
                        isValid = false;
                        return false;
                    }
                    else
                        isValid = true;

                });
                if (isOnlyOneRow == 0)
                    isValid = true;
            }

            return isValid;
        }

        //--------------------FUNCTION:CheckEmpty-----------------------------------------------//
        //DESCRIPTION:
        //
        function CheckEmpty(value, tableTd) {
            if ($.trim(value) == '') {
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

        //--------------------FUNCTION:PopupWindow-----------------------------------------------//
        //DESCRIPTION:
        //
        function PopupWindow(message, input) {
            var blockpanel = $('<div class="master-bloker" >');
            var hcenter = $(window).width() / 2;
            var vcenter = $(window).height() / 2;
            var popuppanel = $('<div class="popup-panel" >');
            var fieldset = $('<div class="popup-fieldset">');

            popuppanel.append('<div class="popup-header"><label class="popup-close" >Close</label></div>')
            .append(fieldset.text(message));

            $('body').append(blockpanel).append(popuppanel);
            hcenter = hcenter - $('.popup-panel').width() / 2;
            vcenter = vcenter - $('.popup-panel').height() / 2;
            $('.popup-panel').css({ 'top': vcenter, 'left': hcenter }).fadeIn('fast');
            $('.master-bloker').fadeIn('fast');

            $('.popup-close').click(function () {
                $('.master-bloker').remove();
                $('.popup-panel').remove();
                input.focus();
            });
        }


    }
})(jQuery);