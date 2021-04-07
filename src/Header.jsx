import './Header.less'

import 'ant-design-vue/es/layout/style'
import Layout from 'ant-design-vue/es/layout'

import PropTypes from 'ant-design-vue/es/_util/vue-types'
import BaseMenu from './components/RouteMenu/BaseMenu'
import { defaultRenderLogoAntTitle, SiderMenuProps } from './components/SiderMenu/SiderMenu'
import GlobalHeader, { GlobalHeaderProps } from './components/GlobalHeader'
import { VueFragment } from './components'
import { isFun } from './utils/util'

const { Header } = Layout

export const HeaderViewProps = {
  ...GlobalHeaderProps,
  ...SiderMenuProps,
  isMobile: PropTypes.bool.def(false),
  collapsed: PropTypes.bool,
  logo: PropTypes.any,
  hasSiderMenu: PropTypes.bool,
  autoHideHeader: PropTypes.bool,
  menuRender: PropTypes.any,
  headerRender: PropTypes.any,
  rightContentRender: PropTypes.any,
  visible: PropTypes.bool.def(true),
}


const renderContent = (h, props,listeners ) => {
  const isTop = props.layout === 'topmenu'
  const isMix = props.layout === 'mix'
  const maxWidth = isMix ? 1200 :1200 - 280 - 120
  const contentWidth = props.contentWidth === 'Fixed'
  const baseCls = 'ant-pro-top-nav-header'
  const { logo, title, theme, isMobile, headerRender, rightContentRender, menuRender, menuHeaderRender } = props

  const rightContentProps = { theme, isTop, isMobile }
  let defaultDom = <GlobalHeader {...{ props: props }} />
  if ((isTop || isMix) && !isMobile) {
    defaultDom = (
      <div class={[baseCls, isMix?'dark':theme]}>
        <div class={[`${baseCls}-main`, contentWidth ? 'wide' : '']}>
          {menuHeaderRender && (
            <div class={`${baseCls}-left`}>
              <div class={`${baseCls}-logo`} key="logo" id="logo">
                {defaultRenderLogoAntTitle(h, { logo, title, menuHeaderRender })}
              </div>
            </div>
          )}
          <div class={`${baseCls}-menu`} style={{ maxWidth: `${maxWidth}px`, flex: 1 }}>
            {menuRender && (isFun(menuRender) && menuRender(h, props) || menuRender) || (<BaseMenu {...{ props: {...props,theme:isMix?'dark':theme},on:listeners }} />) }
          </div>
          {isFun(rightContentRender) && rightContentRender(h, rightContentProps) || rightContentRender}
        </div>
      </div>
    )
  }
  if (headerRender) {
    return headerRender(h, props)
  }
  return defaultDom
}

const HeaderView = {
  name: 'HeaderView',
  props: HeaderViewProps,
  render (h) {
    const {
      visible,
      isMobile,
      layout,
      collapsed,
      siderWidth,
      collapsedWidth,
      fixedHeader,
      autoHideHeader,
      hasSiderMenu,
    } = this.$props
    const props = {...this.$props,menus:this.headerMenus,layout:layout}
    const isTop = layout === 'topmenu'
    const isMix = layout === 'mix'

    const needSettingWidth = fixedHeader && hasSiderMenu && (!isTop && !isMix) && !isMobile

    const className = {
      'ant-pro-fixed-header': fixedHeader,
      'ant-pro-top-menu': isTop || isMix,
    }
    const listeners = {
      click: this.handleTopMenuClick
    }

    // 没有 <></> 暂时代替写法
    return (
      visible ? (
        <VueFragment>
          { (fixedHeader||isMix) && <Header />}

          <Header
            style={{
              padding: 0,
              width: needSettingWidth
                ? `calc(100% - ${collapsed ? collapsedWidth : siderWidth}px)`
                : '100%',
              zIndex: isMix ? 100 :9,
              right: fixedHeader ? 0 : undefined
            }}
            class={className}
          >
            {renderContent(h, props,listeners)}
          </Header>
        </VueFragment>
      ) : null
    )
  },
  methods:{
    handleTopMenuClick(menu){
      this.$emit('top-menu-select', menu)
    }
  },
  computed:{
    headerMenus(){
      if(this.layout ==='topmenu'){
       return this.menus
      }else if(this.layout ==='mix' && this.autoSplitMenus){
        return this.menus.map(menu => { return {...menu, children:undefined }})
      }else{
        return []
      }
    }
  }
}

export default HeaderView
