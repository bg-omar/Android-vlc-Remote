package com.omariskandarani.sharedprefsplugin;

import android.content.Context;
import android.content.SharedPreferences;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SharedPrefsPlugin")
public class SharedPrefsPlugin extends Plugin {

    private SharedPreferences getPreferences() {
        return getContext().getSharedPreferences("com.omariskandarani.sharedprefsplugin", Context.MODE_PRIVATE);
    }

    public void getPreference(PluginCall call) {
        String key = call.getString("key");
        SharedPreferences prefs = getPreferences();
        String value = prefs.getString(key, null);

        JSObject ret = new JSObject();
        ret.put("value", value);
        call.resolve(ret);
    }

    public void setPreference(PluginCall call) {
        String key = call.getString("key");
        String value = call.getString("value");
        SharedPreferences prefs = getPreferences();
        SharedPreferences.Editor editor = prefs.edit();
        editor.putString(key, value);
        editor.apply();

        call.resolve();
    }
}
