var app = getApp()

Page({ 

  /**
   * 页面的初始数据
   */ 
  data: {
    focus: true,
    keyboardvalue: '我的天',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (!app.globalData.userInfo) {
      console.log("userInfo没有信息")
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          console.log("userInfo有信息了： ", app.globalData.userInfo)
        }
      })
    }
    else {
      console.log("userInfo原本就有信息")
    }
    if(!app.globalData.openid){
      console.log("openid没有信息")
      wx.login({
        success: res => {
          wx.request({
            url: 'https://www.kkykykk.xyz/openid',
            method: "PUT",
            data: {
              js_code: res.code
            },
            header: { 'content-type': 'application/json' },
            success: function (res) {
              app.globalData.openid = res.data.openid
              console.log("openid有信息了", res.data.openid);
              //wx.setStorageSync('openid', res.data.openid)
            },
          })
        }
      })
    }
    else{
      console.log("openid原本就有信息")
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    
  },

  bindCommentInput: function (event) {
    var val = event.detail.value;
    this.data.keyboardvalue = val;
    console.log(this.data.keyboardvalue);
  },

  focusshiqu() { 
    this.setData({
      focus: false,
    })
  },

  //先判断textarea中是否有文字输入，如果没有则提醒用户，如何有，则打开地图让用户选择精确的文字，获得精确的经纬度
  sentThoughtnokong() {
    var that = this
    if (this.data.keyboardvalue == '') {
      wx.showModal({
        title: '发送失败',
        content: '请输入您想说的话语',
        cancelText: "返回上级",
        mask: true,
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            that.setData({
              focus: true,
            })
          } else if (res.cancel) {
            console.log('用户点击取消, 返回主显示界面')
            app.globalData.is_from_fabiao = true
            wx.redirectTo({
              url: '../welcome/welcome',
              success: function () {
                console.log("成功跳转回主显示页")
              }
            })
          }
        }
      })
    }
    else {
      this.chooseAddress()
    }
  },

  chooseAddress(){
    var that = this
    if(app.globalData.have_jiaozhun){
      console.log("已经校准过了")
      console.log('即将发送的数据为：', app.globalData.openid, app.globalData.userInfo.nickName, that.data.keyboardvalue, app.globalData.c_lat, app.globalData.c_long)
      this.sentAndBack()
    }
    else{
      wx.chooseLocation({
        success: function (res) {
          var lat_c = res.latitude - app.globalData.c_lat
          var long_c = res.longitude - app.globalData.c_long
          console.log("维度差：", lat_c)
          console.log("经度差:", long_c)
          if (Math.abs(lat_c) > 0.02 || Math.abs(long_c) > 0.02){
            console.log("系统侦测的位置与校准的出入较大")
            wx.showModal({
              title: '校准失败',
              content: '系统监测到您的实际位置与您将要发送数据的位置出入较大，请点击确定重新校准位置，或返回主页面',
              cancelText: '返回发表',
              success: function (res) {
                if (res.confirm) {
                  console.log('用户点击确定')
                  that.chooseAddress()
                } else if (res.cancel) {
                  console.log('用户点击取消')
                  wx.redirectTo({
                    url: '../fabiao/fabiao',
                    success: function () {
                      console.log("成功跳转回发表页")
                    }
                  })
                }
              }
            })
          }
          else{
            app.globalData.c_lat = res.latitude
            app.globalData.c_long = res.longitude
            app.globalData.have_jiaozhun = true
            console.log("现在也算校准了")
            console.log("获得的精确的经纬度为： ", app.globalData.c_long, app.globalData.c_lat)
            console.log('即将发送的数据为：', app.globalData.openid, app.globalData.userInfo.nickName, that.data.keyboardvalue, app.globalData.c_long, app.globalData.c_lat)
            that.sentAndBack()
          }
        }
      })
    }
  },

  sentAndBack(){
    this.sentThought(app.globalData.openid, app.globalData.userInfo.nickName, this.data.keyboardvalue, app.globalData.c_long, app.globalData.c_lat, app.globalData.userInfo.avatarUrl)
    //获得经纬度后发送这颗蒲公英
    //app.globalData.is_from_fabiao = true
    wx.redirectTo({
      url: '../welcome/welcome',
      success: function () {
        console.log("成功跳转回主显示页")
      }
    })
    wx.showToast({
      title: '发送成功',
      icon: 'success',
      duration: 2000,
    })
  },

  //发送这一颗蒲公英种子到数据库，永久保留在这里经纬度, 然后跳转回主显示页面
  sentThought(openid, name, content, long, lat, avatar) {
    console.log("即将发送的数据为：", app.globalData.openid, name, content, [long, lat])
      wx.request({
        url: "https://www.kkykykk.xyz/sentThought",
        method: 'PUT',
        data: {
          openid: openid,
          name: name,
          content: content,
          long_lat : [long, lat],
          avatarUrl: avatar,
        },
        dataType: "json",
        header: {
          "Content-Type": 'application/json'
        },
        success: function (res) {
          console.log( "发送到数据库后返回： ", res.data)
        }
      })
  }

})