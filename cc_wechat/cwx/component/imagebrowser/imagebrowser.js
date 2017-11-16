import { cwx, CPage } from '../../cwx.js';

function _defaultString(opt) {
  if (opt && typeof opt === 'string' && opt.length > 0) {
    return opt;
  }
  return "";
}

CPage({
  pageId: "10320654343",
  data: {
    images: null,
    count: 0,
    bu: null,
    title: '图片浏览',
    index: 0,
    indexTitle: '',
    indexDescription: '',
  },
  onLoad: function (options) {
    if (options.data && options.data.images) {
      var images = options.data.images || [];
      var bu = options.data.bu || "";
      var title = options.data.title || '图片浏览';
      this.setData({
        images: images,
        count: images.length,
        bu: bu,
        title: title,
        index: 0,
        indexTitle: _defaultString(images[0].title),
        indexDescription: _defaultString(images[0].description),
      })
    }

  },
  onShow: function () {
    cwx.setNavigationBarTitle({
      title: this.data.title,
    })
  },
  imageError: function (e) {
    console.log("imageError = ", e.detail)
    var errMsg = e.detail.errMsg || "未知错误";
    var split = errMsg.split(" ");
    var imageUrl = null;
    split.forEach(function (str) {
      if (str.indexOf("http") != -1) {
        imageUrl = str;
      }
    })
    //添加错误埋点
    this.ubtTrace({
      bu: this.data.bu,
      error: errMsg,
    })
  },
  imageLoad: function (e) {
    // console.log( "imageLoad = ", e.detail )
  },
  swiperChange: function (e) {
    console.log(e.detail)
    var current = e.detail.current;
    var images = this.data.images;
    this.setData({
      index: current,
      indexTitle: _defaultString(images[current].title),
      indexDescription: _defaultString(images[current].description),
    })
  }
})