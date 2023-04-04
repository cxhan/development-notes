---
title: flutter移动端模板
---

[TOC]

# flutter移动端模板

> 该模板旨在搭建一个符合前端开发习惯的flutter移动端模板

## 模板目录结构

```dart
flutter_mobile_template
├─.flutter-plugins
├─.flutter-plugins-dependencies
├─.gitignore
├─.metadata
├─README.md
├─analysis_options.yaml
├─flutter_mobile_template.iml
├─flutter_native_splash.yaml //闪屏页配置
├─l10n.yaml //国际化配置
├─pubspec.lock
├─pubspec.yaml //插件配置
├─lib
|  ├─main.dart //项目入口
|  ├─src
|  |  ├─views //视图目录
|  |  |   ├─home.dart
|  |  |   └login.dart
|  |  ├─utils
|  |  |   ├─console.dart //封装Console类（底层为logger插件）
|  |  |   ├─http.dart //封装dio统一http调用服务
|  |  |   └local_storage.dart //封装LocalStorage(底层为shared_preferences插件)以便持久化存储
|  |  ├─service //Http服务
|  |  |    └api.dart
|  |  ├─routes //路由
|  |  |   └router.dart
|  |  ├─provider //provider（root_provider为全局provider）
|  |  |    ├─home_provider.dart
|  |  |    ├─login_provider.dart
|  |  |    ├─root_provider.dart
|  |  ├─constants //常量（常用颜色值、样式、自定义themeConfig）
|  |  |     ├─colors.dart
|  |  |     ├─styles.dart
|  |  |     └theme_config.dart
|  |  ├─components //自定义组件
|  |  |     └slider_captcha.dart
|  |  ├─assets
|  |  |   └logo.png
|  ├─l10n //国际化配置（类似json）
|  |  ├─app_en.arb
|  |  └app_zh.arb
├─ios
├─android
```



## 路由

先封装一个AppRouter类

```dart
// lib/routes/router.dart

// 具名路由封装
class AppRouter {
  // 初始化路由
  static String initialRoute = "/";
  static String loginRoute = "/login";
  static String homeRoute = "/home";

  static final Map<String, Widget Function(BuildContext)> routers = {
    initialRoute: (ctx) => const HomePage(),
    loginRoute: (ctx) => const LoginPage(),
    homeRoute: (ctx) => const HomePage(),
  };
}
```

然后将其属性routers挂载到MaterialApp的routes属性

```dart
// main.dart
MaterialApp(
...
	routes: AppRouter.routers
...
）
```

路由的跳转通过Navigator类进行

```dart
Navigator.of(context).popAndPushNamed(AppRouter.homeRoute); //路由替换
Navigator.of(context).pushNamed(AppRouter.homeRoute); //路由添加
Navigator.of(context).pop(); //路由回退
```

如果要实现更加丰富的路由跳转，譬如动态路由和路由切换动效等可以使用`fluro`库，这里就不做过多的赘述。

## 全局状态管理

模板采用flutter官方推荐的provider插件进行全局状态的管理，使用方法如下：

1. 声明一个**ChangeNotifier**的超类，这里叫**RootProvider**，定义的get属性即是暴露给应用的状态。

```dart
import 'package:flutter/widgets.dart';

// app全局状态管理
class RootProvider extends ChangeNotifier {
  RootProvider();

  String _randomString = 'zh';
  String get randomString => _randomString;
  set randomString(String value) {
    if (_randomString == value) return;
    _randomString = value;
    notifyListeners();
  }
}

```

2. 在所有要用到**RootProvider**的组件外层包裹一个**ChangeNotifierProvider**，他是**ChangeNotifier**的一个超类。

```dart
// RootProvider是应用层的状态，这里直接放到MaterialApp的外部
ChangeNotifierProvider(
  create: (_) => RootProvider(),
  builder: (context, _) {
    return MaterialApp(
      ...
    )
  }
 )
```

3. 对用到**RootProvider**的组件进行监听，建议使用**Selector**，而不是使用官方推荐的**Consumer**，因为<u>Consumer对于provider的任何变化都会重构</u>，而**Selector**可以更加精细化的判断是否需要更新。

```dart
// a.dart
@override
Widget build(BuildContext context) {
  RootProvider rootProvider = Provider.of<RootProvider>(context);
  return Selector<RootProvider, RootProvider>(
    selector: (ctx, vm) => RootProvider(),
    builder: (context, _, child) {
      return ...
        Text('A路由')
        Text(rootProvider.randomString),
        OutlinedButton(
          onPressed: () {
            rootProvider.randomString = Faker().randomGenerator.string(10);
            Navigator.of(context).pushNamed(B路由);
          },
          child: Text('去B路由')
        )
      ...
    }
  )
}
```

```dart
// b.dart
@override
Widget build(BuildContext context) {
  RootProvider rootProvider = Provider.of<RootProvider>(context);
  return Selector<RootProvider, RootProvider>(
    selector: (ctx, vm) => RootProvider(),
    builder: (context, _, child) {
      return ...
        Text('B路由'),
        Text(rootProvider.randomString), // 这里可以看到A路由变化后的新的随机字符串
      	OutlinedButton(
          onPressed: () {
            Navigator.of(context).pop();
          },
          child: Text('返回A路由')
        )
      ...
    }
  )
}
```



## 数据持久化

1. 使用`shared_preferences`库(安卓端基于SharePreferences，iOS端基于NSUserDefaults开发，用于简单key-value形式存储)封装local_storage.dart，用法基本同web开发的localStorage。

```dart
import 'package:shared_preferences/shared_preferences.dart';

class LocalStorage {
  static SharedPreferences? prefs;

  /* app启动前初始化SharedPreferences实例，以后通过同步方法直接获取实例不用再等待异步方法
   * 如果不想在app启动前初始化，可以在使用时再初始化，例如下方被注释的Future类型的方法
   */
  static init() async {
    prefs = await SharedPreferences.getInstance();
  }

  static set(String key, String value) {
    prefs!.setString(key, value);
  }

  static String? get(String key) {
    return prefs!.getString(key);
  }

  static remove(String key) {
    prefs!.remove(key);
  }

  // 清空所有数据
  static clear() {
    prefs!.clear();
  }
}
```

```dart
//在main.dart中初始化
void main() async {
  // Widget绑定器,使得在runApp之前可以处理Widget,方便之后给shared_preferences使用
  WidgetsFlutterBinding.ensureInitialized();
  // SharedPreferences初始化
  await LocalStorage.init();
}
```



2. cookie/session，使用**dio_cookie_manager**、**cookie_jar**两个库用来在http的请求时携带cookie和返回是set-cookie,其中PersistCookieJar类携带的cookie会保存在内存中（关闭应用不会删除），而CookieJar类携带的cookie关闭应用会删除类似session。

```dart
// 添加http-cookie存放目录和拦截器
final Directory appDocDir = await getApplicationDocumentsDirectory();
final String appDocPath = appDocDir.path;
final cookieJar = PersistCookieJar(
  ignoreExpires: true,
  storage: FileStorage('$appDocPath/.cookies/'),
);
_dio.interceptors.add(CookieManager(cookieJar));
```



## 网络请求

基于dio库封装HttpUtils类，统一配置http请求，可以在请求的各个阶段作出相应的处理。

```dart
import 'dart:io';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:flutter/material.dart';
import 'package:flutter_mobile_template/main.dart';
import 'package:flutter_mobile_template/src/routes/router.dart';
import 'package:flutter_mobile_template/src/utils/console.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:flutter_mobile_template/src/utils/local_storage.dart';
import 'package:oktoast/oktoast.dart';
import 'package:path_provider/path_provider.dart';

// 定义一个HttpUtils类使用dio库
class HttpUtils {
  BaseOptions? _options;
  HttpUtils({BaseOptions? options}) {
    _options = options;
  }
  // 单例模式
  static HttpUtils? _instance;
  static HttpUtils get instance {
    _instance ??= HttpUtils._();
    return _instance!;
  }

  // 私有构造函数
  HttpUtils._();

  // dio实例
  late Dio _dio;

  // 请求baseUrl
  final String _baseUrl = 'http://xxx.xxx.xxx';

  bool _isInited = false;

  // 初始化dio实例
  Future<void> init() async {
    try {
      if (_isInited) {
        return;
      }
      BaseOptions initOptions = BaseOptions(
        baseUrl: _baseUrl,
        connectTimeout: const Duration(milliseconds: 10000),
      );
      if (_options != null) {
        Map.from(initOptions as Map).addAll(_options! as Map);
      }
      _dio = Dio(
        initOptions,
      );

      // 添加http-cookie存放目录和拦截器
      final Directory appDocDir = await getApplicationDocumentsDirectory();
      final String appDocPath = appDocDir.path;
      final cookieJar = PersistCookieJar(
        ignoreExpires: true,
        storage: FileStorage('$appDocPath/.cookies/'),
      );
      _dio.interceptors.add(CookieManager(cookieJar));

      _dio.interceptors.add(
        InterceptorsWrapper(
          onRequest: (options, handler) {
            return handler.next(options);
          },
          onResponse: (response, handler) {
            return handler.next(response);
          },
          onError: (DioError e, handler) {
            return handler.next(e);
          },
        ),
      );

      (_dio.httpClientAdapter as IOHttpClientAdapter).onHttpClientCreate =
          (client) {
        client.badCertificateCallback = (cert, host, port) {
          return true;
        };
        return client;
      };

      (_dio.httpClientAdapter as IOHttpClientAdapter).validateCertificate =
          (cert, host, port) {
        if (_baseUrl.contains(host)) {
          return true;
        } else {
          return false;
        }
      };
    } finally {
      _isInited = true;
    }
  }

  // get请求
  Future<Response> get(String url, {Map<String, dynamic>? params}) async {
    try {
      await init();
      return await _dio.get(url, queryParameters: params);
    } on DioError catch (err) {
      return Response(requestOptions: RequestOptions(), data: err.error);
    }
  }

  // post请求
  Future<Response> post(String url, {Map<String, dynamic>? params}) async {
    try {
      await init();
      return await _dio.post(url, data: params);
    } on DioError catch (err) {
      return Response(requestOptions: RequestOptions(), data: err.error);
    }
  }
}

```



## 国际化配置

1. UI框架的国际化,项目中使用了**Material**、**Bruno**两个UI库，只需要在main.dart中添加对应的国际化delegate方法即可。

```dart
// 首先添加两个package
flutter pub add flutter_localizations --sdk=flutter
flutter pub add intl:any

// 然后再main.dart中添加对应框架的国际化方法
return const MaterialApp(
  localizationsDelegates: [
    GlobalWidgetsLocalizations.delegate,
    GlobalMaterialLocalizations.delegate,
    GlobalCupertinoLocalizations.delegate,
    BrnLocalizationDelegate.delegate,
  ],
  supportedLocales: const [
    Locale('zh'),
    Locale('en'),
  ],
  ...
);
```

2. 本地信息的国际化，需要用到package在第一步中已经添加，这里只需要进行对应的配置即可

   2.1 在`pubspec.yaml` 文件中，启用 `generate` 标志

   ```yaml
   flutter:
   	generate: true
   ```

   2.2 项目跟目录创建l10n.yaml文件,内容如下

   ```yaml
   arb-dir: lib/l10n
   template-arb-file: app_zh.arb
   output-localization-file: app_localizations.dart
   ```

   2.3 在lib目录下添加l10n文件夹，创建 `app_en.arb`和 `app_zh.arb`文件

   ```json
   // app_zh.arb
   {
     "text1": "文本1:{string}"
   }
   // app_en.arb
   {
     "text1": "Text1:{string}"
   }
   ```

   2.4 终端运行`flutter gen-l10n`命令就会在${FLUTTER_PROJECT}/.dart_tool/flutter_gen/gen_l10n` 中看到生成的文件。

   2.5 在MaterailApp国际化配置中添加`AppLocalizations.delegate`，同时用`Localizations.override`包裹子组件以使国际化生效

   ```dart
   import 'package:flutter_gen/gen_l10n/app_localizations.dart'; //gen命令生成的package导入
   ...
   return const MaterialApp(
     localizationsDelegates: [
       AppLocalizations.delegate, //自定义内容的国际化
       GlobalWidgetsLocalizations.delegate,
       GlobalMaterialLocalizations.delegate,
       BrnLocalizationDelegate.delegate,
     ],
     supportedLocales: const [
       Locale('zh'),
       Locale('en'),
     ],
     ...
     builder: (context, child) {
       return Localizations.override(
         locale: Provider.of<RootProvider>(context).settedLocale,
         context: context,
         child: child!,
       );
     },
     routes: AppRouter.routers,
   );
   ```

   2.6 在业务组件中使用

   ```dart
   import 'package:flutter_gen/gen_l10n/app_localizations.dart';
   ...
   	SizedBox(
       width: 300,
       height: 40,
       child: TextField(
         obscureText: false,
         decoration: InputDecoration(
           border: const OutlineInputBorder(),
           labelText: AppLocalizations.of(context)!.text1($string),
         ),
       ),
     ),
   ...
   ```

3. 为了方便监听l10n目录下文件的改动自动生成国际化文件，可以使用fswatch插件

```shell
# mac下安装fswatch
brew install fswatch

# fswatch监听目录的改动
fswatch $DIR | while read file;
do
	echo "$file changed."
	# 监听到文件变动执行l10n生成命令，在实际的项目中需要把这个命令放到另一个脚本中执行，避免因为命令执行错误导致退出监听
	exec flutter gen-l10n 
done
```



## 自定义字体

1. flutter支持的字体格式有`.otf`、`.ttf`、`.ttc`。
2. pubsepc.yaml中声明字体

```yaml
flutter:
  fonts:
    - family: Alkatra-Bold
      fonts:
        - asset: lib/src/assets/fonts/Alkatra-Bold.ttf //字体文件位置
          style: normal //字体轮廓
          weight: 700 //字重
```

3. 全局默认字体

```dart
return MaterialApp(
  theme: ThemeData(fontFamily: 'Alkatra-Regular'), //设置默认字体
  home: const MyHomePage(),
);
```

4. 使用字体

```dart
Text(
  'abcdefg',
  style: const TextStyle(
    color: AppColor.primaryTextColor,
    fontSize: 16,
    fontFamily: 'Alkatra-Bold', //使用自定义字体
  ),
)
```



## 其他自定义配置

1. 闪屏页，用到`flutter_native_splash`库做静态闪屏页，其他的动态闪屏页也有`animated_splash_screen`方案。

```yaml
//根目录添加flutter_native_splash.yaml文件即可
flutter_native_splash:
  # 该插件允许你使用自定义的闪屏界面替换 Flutter 默认的白色闪屏界面。
  # 自定义下面的参数，然后在命令行终端运行下面的命令：
  # flutter pub run flutter_native_splash:create
  # 要恢复为 Flutter 默认的白色闪屏界面，运行下面的命令：
  # flutter pub run flutter_native_splash:remove

  # 只有 color 或 background_image 是必需的参数。使用 color 将闪屏界面的背景设置为单色。
  # 使用 background_image 可将 png 图像设置为闪屏界面的背景。该图像会被拉伸以适应应用大小。
  # color 和 background_image 不能同时设置，只有一个会被使用。
  color: "#6A3DE8"
  # background_image: "lib/src/assets/logo.png"

  # 以下是可选的参数。去掉注释前面的 #可使参数起作用。

  # image 参数允许你指定在闪屏界面使用的图像。它必须是 png 文件，且应该是用于4倍像素密度的大小。
  image: lib/src/assets/logo.png

  # 该属性允许你指定图像作为商标在闪屏界面显示。它必须是 png 文件。现在它只支持 Android 和 iOS 。
  # branding: assets/dart.png

  # 为黑暗模式指定商标图像
  # branding_dark: assets/dart_dark.png

  # 要将商标图像放置在界面底部，可以使用 bottom 、 bottomRight 和 bottomLeft 。如果未指定或者指定了其它值，使用默认值 bottom 。
  # 确保该内容模式值与 android_gravity 值 和 ios_content_mode 值不相似。
  # branding_mode: bottom

  # color_dark 、 background_image_dark 和 image_dark 用于设备在黑暗模式时设置背景色和图像。
  # 如果没有指定，应用会使用上面的参数。如果指定了 image_dark ，必须要指定 color_dark 或 background_image_dark 。
  # color_dark 和 background_image_dark 不能同时设置。
  # color_dark: "#042a49"
  # background_image_dark: "assets/dark-background.png"
  # image_dark: assets/splash-invert.png

  # android 、 ios 和 web 参数可用于不为对应的平台生成闪屏界面。
  # android: false
  # ios: false
  # web: false

  # 可用 android_gravity 、 android_gravity 、 ios_content_mode 和 web_image_mode 来设置闪屏图像的位置。默认是居中。
  # android_gravity 可以是以下 Android Gravity 其中之一 (查看
  # https://developer.android.com/reference/android/view/Gravity): bottom 、 center 、
  # center_horizontal 、 center_vertical 、 clip_horizontal 、 clip_vertical 、
  # end 、 fill 、 fill_horizontal 、 fill_vertical 、 left 、 right 、 start 或 top 。
  # android_gravity: center
  #
  # ios_content_mode 可以是以下 iOS UIView.ContentMode 其中之一 (查看
  # https://developer.apple.com/documentation/uikit/uiview/contentmode): scaleToFill 、
  # scaleAspectFit 、 scaleAspectFill 、 center 、 top 、 bottom 、
  # left 、 right 、 topLeft 、 topRight 、 bottomLeft 或  bottomRight 。
  # ios_content_mode: center
  #
  # web_image_mode 可以是以下模式其中之一：center 、 contain 、 stretch 和 cover 。
  # web_image_mode: center

  # 要隐藏通知栏，使用 fullscreen 参数 。在 Web 上不起作为，因为 Web 没有通知栏。默认是 false 。
  # 注意: 不像 Android 、 iOS 当应用加载时不会自动显示通知栏。
  #       要显示通知栏，在 Flutter 应用中添加以下代码：
  #       WidgetsFlutterBinding.ensureInitialized();
  #       SystemChrome.setEnabledSystemUIOverlays([SystemUiOverlay.bottom, SystemUiOverlay.top]);
  # fullscreen: true

  # 如果改变了 info.plist 的名字，可以使用 info_plist_files 指定对应的文件名。
  # 只需移除下面三行前面的 # 字符，不要移除任何空格：
  # info_plist_files:
  # - 'ios/Runner/Info-Debug.plist'
  # - 'ios/Runner/Info-Release.plist'
```

2. 应用logo和名称配置

   2.1 logo配置资源网站（[icon.kitchen](https://icon.kitchen/)）上去自定义logo的样式下载下来的文件放到对应平台的目录ios目录路径**ios/Runner/Assets.xcassets/AppIcon.appiconset**，android目录路径为**android/app/src/main/res**

   2.2 名称在对应平台的配置文件中修改即可

   ```xml
   //ios应用名称对应字段为CFBundleDisplayName(ios/Runner/Info.plist)
   <?xml version="1.0" encoding="UTF-8"?>
   <!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
   <plist version="1.0">
   	<dict>
   		<key>CFBundleDevelopmentRegion</key>
   		<string>$(DEVELOPMENT_LANGUAGE)</string>
   		<key>CFBundleDisplayName</key>
   		<string>Demo</string>
   		<key>CFBundleExecutable</key>
   		<string>$(EXECUTABLE_NAME)</string>
   		<key>CFBundleIdentifier</key>
   		<string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
   		<key>CFBundleInfoDictionaryVersion</key>
   		<string>6.0</string>
   		<key>CFBundleName</key>
   		<string>app名称</string>
   		<key>CFBundlePackageType</key>
   		<string>APPL</string>
   		<key>CFBundleShortVersionString</key>
   		<string>$(FLUTTER_BUILD_NAME)</string>
   		<key>CFBundleSignature</key>
   		<string>????</string>
   		<key>CFBundleVersion</key>
   		<string>$(FLUTTER_BUILD_NUMBER)</string>
   		<key>LSRequiresIPhoneOS</key>
   		<true/>
   		<key>UILaunchStoryboardName</key>
   		<string>LaunchScreen</string>
   		<key>UIMainStoryboardFile</key>
   		<string>Main</string>
   		<key>UISupportedInterfaceOrientations</key>
   		<array>
   			<string>UIInterfaceOrientationPortrait</string>
   			<string>UIInterfaceOrientationLandscapeLeft</string>
   			<string>UIInterfaceOrientationLandscapeRight</string>
   		</array>
   		<key>UISupportedInterfaceOrientations~ipad</key>
   		<array>
   			<string>UIInterfaceOrientationPortrait</string>
   			<string>UIInterfaceOrientationPortraitUpsideDown</string>
   			<string>UIInterfaceOrientationLandscapeLeft</string>
   			<string>UIInterfaceOrientationLandscapeRight</string>
   		</array>
   		<key>UIViewControllerBasedStatusBarAppearance</key>
   		<false/>
   		<key>CADisableMinimumFrameDurationOnPhone</key>
   		<true/>
   		<key>UIApplicationSupportsIndirectInputEvents</key>
   		<true/>
   		<key>UIStatusBarHidden</key>
   		<false/>
   	</dict>
   </plist>
   
   ```

   

   ```xml
   //android应用名称对应android:label字段（android/app/src/main/AndroidManifest.xml）
   <manifest xmlns:android="http://schemas.android.com/apk/res/android"
       package="com.example.flutter_mobile_template">
      <application
           android:label="demo"
           android:name="${applicationName}"
           android:icon="@mipmap/ic_launcher">
           <activity
               android:name=".MainActivity"
               android:exported="true"
               android:launchMode="singleTop"
               android:theme="@style/LaunchTheme"
               android:configChanges="orientation|keyboardHidden|keyboard|screenSize|smallestScreenSize|locale|layoutDirection|fontScale|screenLayout|density|uiMode"
               android:hardwareAccelerated="true"
               android:windowSoftInputMode="adjustResize">
               <!-- Specifies an Android theme to apply to this Activity as soon as
                    the Android process has started. This theme is visible to the user
                    while the Flutter UI initializes. After that, this theme continues
                    to determine the Window background behind the Flutter UI. -->
               <meta-data
                 android:name="io.flutter.embedding.android.NormalTheme"
                 android:resource="@style/NormalTheme"
                 />
               <intent-filter>
                   <action android:name="android.intent.action.MAIN"/>
                   <category android:name="android.intent.category.LAUNCHER"/>
               </intent-filter>
           </activity>
           <!-- Don't delete the meta-data below.
                This is used by the Flutter tool to generate GeneratedPluginRegistrant.java -->
           <meta-data
               android:name="flutterEmbedding"
               android:value="2" />
       </application>
   </manifest>
   
   ```



## 应用打包

To be continued ...



## 附录：

### Pubspec.yaml

```yaml
name: flutter_mobile_template
description: A new Flutter project.
version: 1.0.0+1

environment:
  sdk: '>=2.19.2 <3.0.0'
dependencies:
  flutter:
    sdk: flutter
  bruno: ^3.2.0
  cookie_jar: ^3.0.1
  cupertino_icons: ^1.0.2
  dio: ^5.1.0
  dio_cookie_manager: ^2.1.3
  faker: ^2.1.0
  flutter_native_splash: ^2.2.19
  logger: ^1.3.0
  path_provider: ^2.0.14
  pretty_dio_logger: ^1.3.1
  provider: ^6.0.5
  shared_preferences: ^2.0.20
  encrypt: ^5.0.1
  pointycastle: ^3.7.2
  oktoast: ^3.3.1
  flutter_localizations:
    sdk: flutter
  intl: any

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^2.0.0
flutter:
  uses-material-design: true
  generate: true
  assets:
    - lib/src/assets/logo.png
```

