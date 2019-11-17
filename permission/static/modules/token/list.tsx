import { DataListPage } from "components/index";
import { TokenData } from "gatewayEntities";
import { DataSource } from "maishu-wuzhui";
import { dataSources } from "services/data-sources";
import { boundField, dateTimeField } from "maishu-wuzhui-helper";

export default class TokenListPage extends DataListPage<TokenData>{
    dataSource: DataSource<TokenData> = dataSources.token;
    itemName: string = "令牌";
    columns = [
        boundField<TokenData>({ dataField: "id", headerText: "编号", itemStyle: { width: "300px" } }),
        boundField<TokenData>({ dataField: "user_id", headerText: "用户编号" }),
        dateTimeField<TokenData>({ headerText: "创建时间", dataField: "create_date_time" })
    ];


}