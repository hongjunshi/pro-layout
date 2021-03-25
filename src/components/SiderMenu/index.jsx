import './index.less'

import 'ant-design-vue/es/drawer/style'
import Drawer from 'ant-design-vue/es/drawer'
import SiderMenu, { SiderMenuProps } from './SiderMenu'

const SiderMenuWrapper = {
  name: 'SiderMenuWrapper',
  model: {
    prop: 'collapsed',
    event: 'collapse'
  },
  props: SiderMenuProps,
  render (h) {
    const {
      layout,
      isMobile,
      collapsed,
      theme
    } = this
    const isTopMenu = layout === 'topmenu'
    const isMix = layout === 'mix'
    const handleCollapse = (e) => {
      this.$emit('collapse', true)
    }
    return isMobile ? (
      <Drawer
        class="ant-pro-sider-menu"
        visible={!collapsed}
        placement="left"
        maskClosable
        getContainer={null}
        onClose={handleCollapse}
        bodyStyle={{
          padding: 0,
          height: '100vh'
        }}
      >
        <SiderMenu {...{ props: {...this.$props, menus:this.siderMenus, collapsed: isMobile ? false : collapsed} }} />
      </Drawer>
    ) : !isTopMenu &&(
      <SiderMenu class="ant-pro-sider-menu" {...{ props: {...this.$props,menus:this.siderMenus,theme:isMix?'light':theme} }} />
    )
  },
  computed:{
    siderMenus(){
      console.log('SiderMenuWrapper',this.topMenu)
      if(this.layout==='mix'){
        if(!this.topMenu){
          return []
        }
        const menu = this.menus.find(i=> i.path ===this.topMenu.path || i.path ===this.topMenu.key)
        if(menu && menu.children){
          return menu.children
        }else{
          return []
        }
      }else{
        return this.menus
      }
    }
  },
  watch:{
    topMenu(val){
      console.log(val)
    }
  }
}

SiderMenuWrapper.install = function (Vue) {
  Vue.component(SiderMenuWrapper.name, SiderMenuWrapper)
}

export {
  SiderMenu,
  SiderMenuProps
}

export default SiderMenuWrapper
