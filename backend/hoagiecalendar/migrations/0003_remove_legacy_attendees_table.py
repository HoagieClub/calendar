from django.db import migrations


def remove_legacy_attendees_table(apps, schema_editor):
    # Earlier versions of 0002 removed the field from migration state only.
    # On databases that applied that version, drop the leftover join table.
    table = "Event_attendees"
    if table in schema_editor.connection.introspection.table_names():
        schema_editor.execute(f"DROP TABLE {schema_editor.quote_name(table)}")


class Migration(migrations.Migration):
    dependencies = [
        ("hoagiecalendar", "0002_alter_event_options_remove_event_attendees_and_more"),
    ]

    operations = [migrations.RunPython(remove_legacy_attendees_table, migrations.RunPython.noop)]
