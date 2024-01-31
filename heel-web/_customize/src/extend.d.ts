import { ComponentCustomProperties } from "@vue/runtime-core";
import UtilsInterface from './utils/interface';
import ServerInterface from './utils/server';

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $utils: UtilsInterface; // 工具类
        $server: ServerInterface; // 接口类
    }
}
// 必须导出，才能在其他文件中使用
export default ComponentCustomProperties;