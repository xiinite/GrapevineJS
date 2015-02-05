/**
 * Created by daeme_000 on 5-2-2015.
 */
var model = require('../models/Character.js');
var fs = require('fs');

module.exports = {
    'exportjson': function (res, next, chronicleid) {
        model.findPlain({chronicle: chronicleid}, function (err, result) {
            if (err) {
                next(new Error(err));
                return;
            }

            var output = "[";

            var first = true;
            result.forEach(function (char, i) {
                if(first == false){
                    output += " ,";
                }else{
                    first = false;
                }
                output += JSON.stringify(char) + "\n";
            });
            output += "]";

            fs.writeFile('.\\tmp\\export.json', output, {encoding: 'binary'}, function (err) {
                if (err) throw res.json(err);

                res.download('.\\tmp\\export.json');
            });
        });
    },
    'exportgv3': function (res, next, chronicleid) {
        model.find({chronicle: chronicleid}, function (err, result) {
            if (err) {
                next(new Error(err));
                return;
            }

            var xml = '<?xml version="1.0"?>\n';
            xml += '<grapevine version="3" chronicle="Exported" randomtraits="7,5,3,5,5,5,5" menupath="Grapevine Menus.gvm" size="224">\n';
            xml += '    <usualplace>\n';
            xml += '    </usualplace>\n';
            xml += '    <description>\n';
            xml += '    </description>\n';
            xml += '    <calendar lastmodified="01/01/2014 00:00:00">\n';
            xml += '    </calendar>\n';

            xml += '            <award use="XP" name="Attendance" type="0" change="1" reason="Attendance"/>\n';
            xml += '            <award use="PP" name="Bookkeeping" type="0" change="1" reason="Bookkeeping"/>\n';
            xml += '            <award use="XP" name="Costuming" type="0" change="1" reason="Costuming"/>\n';
            xml += '            <award use="XP" name="Downtime Activities" type="0" change="1" reason="Downtime Activities"/>\n';
            xml += '            <award use="XP" name="First Night" type="0" change="1" reason="First Night"/>\n';
            xml += '            <award use="XP" name="Good Roleplaying" type="0" change="1" reason="Good Roleplaying"/>\n';
            xml += '            <award use="XP" name="Leadership" type="0" change="1" reason="Leadership"/>\n';
            xml += '            <award use="PP" name="Narrating" type="0" change="1" reason="Narrating"/>\n';
            xml += '            <award use="PP" name="Setup/Cleanup" type="0" change="1" reason="Setup/Cleanup"/>\n';
            xml += '            <award use="PP" name="Storytelling" type="0" change="1" reason="Storytelling"/>\n';
            xml += '            <template name="Action and Rumor Report" text="Templates\\Text\\Action and Rumor Report.txt" rtf="D:\\Ce\\Nachtkronieken\\Grapevine\\Templates\\RTF\\Action and Rumor Report.rtf" html="Templates\\HTML\\Action and Rumor Report.html"/>\n';
            xml += '            <template name="Changeling Character Sheet" sheet="yes" text="Templates\\Text\\Changeling.txt" rtf="Templates\\RTF\\Changeling.rtf" html="Templates\\HTML\\Changeling.html"/>\n';
            xml += '            <template name="Character Equipment" text="Templates\\Text\\Character Equipment.txt" rtf="Templates\\RTF\\Character Equipment.rtf" html="Templates\\HTML\\Character Equipment.html"/>\n';
            xml += '            <template name="Character Roster" text="Templates\\Text\\Character Roster.txt" rtf="F:\\Nachtkronieken\\Grapevine\\Templates\\RTF\\Character Roster.rtf" html="Templates\\HTML\\Character Roster.html"/>\n';
            xml += '            <template name="Demon Character Sheet" sheet="yes" text="Templates\\Text\\Demon.txt" rtf="Templates\\RTF\\Demon.rtf" html="Templates\\HTML\\Demon.html"/>\n';
            xml += '            <template name="Experience History" text="Templates\\Text\\Experience History.txt" rtf="Templates\\RTF\\Vampire.rtf" html="Templates\\HTML\\Experience History.html"/>\n';
            xml += '            <template name="Fera Character Sheet" sheet="yes" text="Templates\\Text\\Fera.txt" rtf="Templates\\RTF\\Fera.rtf" html="Templates\\HTML\\Fera.html"/>\n';
            xml += '            <template name="Game Calendar" text="Templates\\Text\\Game Calendar.txt" rtf="Templates\\RTF\\Game Calendar.rtf" html="Templates\\HTML\\Game Calendar.html"/>\n';
            xml += '            <template name="Hunter Character Sheet" sheet="yes" text="Templates\\Text\\Hunter.txt" rtf="Templates\\RTF\\Hunter.rtf" html="Templates\\HTML\\Hunter.html"/>\n';
            xml += '            <template name="Influence Report" text="Templates\\Text\\Influence Report.txt" html="Templates\\HTML\\Influence Report.html"/>\n';
            xml += '            <template name="Item Cards" text="Templates\\Text\\Item Cards.txt" rtf="Templates\\RTF\\Item Cards.rtf" html="Templates\\HTML\\Item Cards.html"/>\n';
            xml += '            <template name="Kuei-Jin Character Sheet" sheet="yes" text="Templates\\Text\\Kuei-Jin.txt" rtf="Templates\\RTF\\Kuei-Jin.rtf" html="Templates\\HTML\\Kuei-Jin.html"/>\n';
            xml += '            <template name="Location Cards" text="Templates\\Text\\Location Cards.txt" rtf="Templates\\RTF\\Location Cards.rtf" html="Templates\\HTML\\Location Cards.html"/>\n';
            xml += '            <template name="Mage Character Sheet" sheet="yes" text="Templates\\Text\\Mage.txt" rtf="Templates\\RTF\\Mage.rtf" html="Templates\\HTML\\Mage.html"/>\n';
            xml += '            <template name="Master Action Report" text="Templates\\Text\\Master Action Report.txt" rtf="Templates\\RTF\\Master Action Report.rtf" html="Templates\\HTML\\Master Action Report.html"/>\n';
            xml += '            <template name="Master Rumor Report" text="Templates\\Text\\Master Rumor Report.txt" rtf="Templates\\RTF\\Master Rumor Report.rtf" html="Templates\\HTML\\Master Rumor Report.html"/>\n';
            xml += '            <template name="Merits and Flaws Report" text="Templates\\Text\\Merits and Flaws Report.txt" rtf="F:\\Nachtkronieken\\Grapevine\\Templates\\RTF\\Merits and Flaws Report.rtf" html="Templates\\HTML\\Merits and Flaws Report.html"/>\n';
            xml += '            <template name="Mortal Character Sheet" sheet="yes" text="Templates\\Text\\Mortal.txt" rtf="Templates\\RTF\\Mortal.rtf" html="Templates\\HTML\\Mortal.html"/>\n';
            xml += '            <template name="Mummy Character Sheet" sheet="yes" text="Templates\\Text\\Mummy.txt" rtf="Templates\\RTF\\Mummy.rtf" html="Templates\\HTML\\Mummy.html"/>\n';
            xml += '            <template name="Player Point History" text="Templates\\Text\\Player Point History.txt" rtf="Templates\\RTF\\Player Point History.rtf" html="Templates\\HTML\\Player Point History.html"/>\n';
            xml += '            <template name="Player Roster" text="Templates\\Text\\Player Roster.txt" rtf="Templates\\RTF\\Player Roster.rtf" html="Templates\\HTML\\Player Roster.html"/>\n';
            xml += '            <template name="Plot Report" text="Templates\\Text\\Plot Report.txt" rtf="Templates\\RTF\\Plot Report.rtf" html="Templates\\HTML\\Plot Report.html"/>\n';
            xml += '            <template name="Rote Cards" text="Templates\\Text\\Rote Cards.txt" rtf="Templates\\RTF\\Rote Cards.rtf" html="Templates\\HTML\\Rote Cards.html"/>\n';
            xml += '            <template name="Search Report" text="Templates\\Text\\Search Report.txt" rtf="Templates\\RTF\\Search Report.rtf" html="Templates\\HTML\\Search Report.html"/>\n';
            xml += '            <template name="Sign-In Sheet" text="Templates\\Text\\Sign-In Sheet.txt" rtf="F:\\Nachtkronieken\\Grapevine\\Templates\\RTF\\Sign-In Sheet.rtf" html="Templates\\HTML\\Sign-In Sheet.html"/>\n';
            xml += '            <template name="Statistics Report" text="Templates\\Text\\Statistics Report.txt" rtf="F:\\Nachtkronieken\\Grapevine\\Templates\\RTF\\Statistics Report.rtf" html="Templates\\HTML\\Statistics Report.html"/>\n';
            xml += '            <template name="Vampire Character Sheet" sheet="yes" text="Templates\\Text\\Vampire.txt" rtf="Templates\\RTF\\Vampire.rtf" html="Templates\\HTML\\Vampire.html"/>\n';
            xml += '            <template name="Vampire Status Report" text="Templates\\Text\\Vampire Status Report.txt" rtf="F:\\Nachtkronieken\\Grapevine\\Templates\\RTF\\Vampire Status Report.rtf" html="Templates\\HTML\\Vampire Status Report.html"/>\n';
            xml += '            <template name="Various Character Sheet" sheet="yes" text="Templates\\Text\\Various.txt" rtf="Templates\\RTF\\Various.rtf" html="Templates\\HTML\\Various.html"/>\n';
            xml += '            <template name="Werewolf Character Sheet" sheet="yes" text="Templates\\Text\\Werewolf.txt" rtf="Templates\\RTF\\Werewolf.rtf" html="Templates\\HTML\\Werewolf.html"/>\n';
            xml += '            <template name="Wraith Character Sheet" sheet="yes" text="Templates\\Text\\Wraith.txt" rtf="Templates\\RTF\\Wraith.rtf" html="Templates\\HTML\\Wraith.html"/>\n';
            xml += '            <aprsettings personalactions="4" publicrumors="yes" influencerumors="yes" previousrumors="yes">\n';
            xml += '            <traitlist name="Actions" abc="no" display="0">\n';
            xml += '            <trait name="1"/>\n';
            xml += '            <trait name="2" val="3"/>\n';
            xml += '            <trait name="3" val="6"/>\n';
            xml += '            <trait name="4" val="10"/>\n';
            xml += '            <trait name="5" val="15"/>\n';
            xml += '            <trait name="6" val="21"/>\n';
            xml += '            <trait name="7" val="28"/>\n';
            xml += '            <trait name="8" val="36"/>\n';
            xml += '            <trait name="9" val="45"/>\n';
            xml += '            <trait name="10" val="55"/>\n';
            xml += '            </traitlist>\n';
            xml += '            <traitlist name="Backgrounds" abc="no" display="0">\n';
            xml += '            <trait name="Allies"/>\n';
            xml += '            <trait name="Contacts"/>\n';
            xml += '            <trait name="Retainers"/>\n';
            xml += '            </traitlist>\n';
            xml += '            </aprsettings>\n';

            result.forEach(function (char, i) {
                xml += '               <vampire name="' + char.name + '" nature="' + char.nature + '" demeanor="' + char.demeanor + '" clan="' + char.clan + '" sect="' + char.sect + '" sire="' + char.sire
                xml += '" generation="' + char.generation + '" blood="' + char.bloodpool.total + '" willpower="' + char.willpower.total + '" conscience="' + char.conscience + '" selfcontrol="' + char.selfcontrol
                xml += '" courage="' + char.courage + '" path="' + char.path.type + '" pathtraits="' + char.rating + '" physicalmax="12" player="" status="' + char.state + '" startdate="26/07/2014 19:03:37" npc="yes" lastmodified="23/10/2014 20:47:10">\n';
                xml += '                <experience unspent="' + char.experience.unspent + '" earned="' + char.experience.total + '">\n';

                char.experiencehistory.forEach(function (entry, j) {
                    xml += '                <entry date="01/01/2014" change="' + entry.change + '" type="0" reason="' + entry.reason + '" earned="1" unspent="1"/>\n';
                });

                xml += '                </experience>\n';


                xml += '               </vampire>\n';

            });

            xml += '</grapevine>'
            fs.writeFile('.\\tmp\\export.gv3', xml, {encoding: 'binary'}, function (err) {
                if (err) throw res.json(err);

                res.download('.\\tmp\\export.gv3');
            });
        });
    }
}