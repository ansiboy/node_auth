import { DataListPage } from "maishu-chitu-admin/static";
import { dataSources, MenuItem } from "../services/data-sources";
import { boundField, dateTimeField, customDataField, DataControlField } from "maishu-wuzhui-helper";
import ReactDOM = require("react-dom");
import React = require("react");
import { services } from "../services/index";

let sortFieldWidth = 80;
let nameFieldWidth = 180;
let iconFieldWidth = 120;
let roleFieldWidth = 180;

export default class MenuListPage extends DataListPage<MenuItem> {
    dataSource = dataSources.resource
    itemName = "菜单";

    constructor(props) {
        super(props)

        this.pageSize = null;
        this.headerFixed = true;
    }

    parentDeep(menuItem: MenuItem) {
        let deep = 0;
        let parent = menuItem.parent;
        while (parent) {
            deep = deep + 1;
            parent = parent.parent;
        }

        return deep;
    }

    columns: DataControlField<MenuItem>[] = [
        boundField<MenuItem>({
            dataField: "sortNumber", itemStyle: { width: `${sortFieldWidth}px` }, headerText: "序号", readOnly: true,
        }),
        customDataField<MenuItem>({
            headerText: "菜单名称",
            itemStyle: { width: `${nameFieldWidth}px` },
            render: (dataItem, element) => {
                element.style.paddingLeft = `${this.parentDeep(dataItem) * 20 + 10}px`;
                element.innerHTML = dataItem.name;
            }
        }),
        boundField<MenuItem>({ dataField: "icon", headerText: "图标", itemStyle: { width: `${iconFieldWidth}px` }, readOnly: true }),
        boundField<MenuItem>({
            dataField: "roleNames", headerText: "角色", itemStyle: { width: `${roleFieldWidth}px` },

            createControl() {
                let element = document.createElement("div");
                let cotnrolValue: string;
                services.gateway.roleList().then(items => {
                    ReactDOM.render(<>
                        {items.dataItems.map(o => <label key={o.id} className="checkbox-inline">
                            <input type="checkbox" id="inlineCheckbox1" value={o.id} ref={e => {
                                if (!e) return;
                                e.checked = cotnrolValue.indexOf(o.id) >= 0;
                                e.onclick = () => {
                                    if (cotnrolValue.indexOf(o.id) >= 0)
                                        return;

                                    cotnrolValue = cotnrolValue + "," + o.id;
                                }

                            }} />
                            <span>{o.name}</span>
                        </label>)}
                    </>, element);
                })

                return {
                    element: element,
                    get value() {
                        return cotnrolValue;
                    },
                    set value(value) {
                        cotnrolValue = value;
                    }
                }
            },
            renderItem(dataItem, element) {
                element.innerText = dataItem.roleNames
            }
        }),
        boundField<MenuItem>({ dataField: "path", headerText: "路径", readOnly: true }),
    ];


}


