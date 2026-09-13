plugins {
    id("com.android.application")
    id("kotlin-android")
    id("dev.flutter.flutter-gradle-plugin")
    id("com.google.gms.google-services")
}

import java.util.Properties
import java.io.FileInputStream

val keystorePropertiesFile = rootProject.file("key.properties")
val keystoreProperties = Properties()
val hasReleaseKeystore =
    keystorePropertiesFile.exists().also { exists ->
        if (exists) {
            keystoreProperties.load(FileInputStream(keystorePropertiesFile))
        }
    }

android {
    namespace = "com.jwellers.mobile"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17.toString()
    }

    defaultConfig {
        applicationId = "com.jwellers.mobile"
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    flavorDimensions += "client"
    productFlavors {
        create("demo") {
            dimension = "client"
            applicationId = "com.yourco.demojewellers"
            resValue("string", "app_name", "Demo Jewellers")
        }
        create("ratnaraj") {
            dimension = "client"
            applicationId = "com.ratnaraj.jewellers"
            resValue("string", "app_name", "Ratnaraj Jewellers")
        }
        create("acme") {
            dimension = "client"
            applicationId = "com.acme.jewellers"
            resValue("string", "app_name", "Acme Jewellers")
        }
    }

    signingConfigs {
        if (hasReleaseKeystore) {
            create("release") {
                keyAlias = keystoreProperties["keyAlias"] as String
                keyPassword = keystoreProperties["keyPassword"] as String
                storeFile = file(keystoreProperties["storeFile"] as String)
                storePassword = keystoreProperties["storePassword"] as String
            }
        }
    }

    buildTypes {
        release {
            // Store builds require android/key.properties + client keystore (see docs/phase27/SIGNING_HANDOFF.md).
            // Local/dev release falls back to debug signing so `flutter build` still works without secrets.
            signingConfig =
                if (hasReleaseKeystore) {
                    signingConfigs.getByName("release")
                } else {
                    signingConfigs.getByName("debug")
                }
        }
    }
}

flutter {
    source = "../.."
}
